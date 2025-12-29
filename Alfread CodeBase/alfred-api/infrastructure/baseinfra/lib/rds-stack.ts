import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import { BaseStack } from './base';

export class RDSStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    // The code that defines your stack goes here
    // Import VPC
    const importedVPC = ec2.Vpc.fromLookup(this, `${stage}-ExportedDashboardApiVPC`, {
      vpcName: `${stage}-dashboard-api-vpc`,
    });

    // Create a secret in Secrets Manager for the database credentials
    const databaseSecret = new secretsmanager.Secret(this, `${stage}-dashboard-db-secret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'alfred' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 36,
      },
      secretName: `${stage}/db`
    });

    const keysSecret = new secretsmanager.Secret(this, 'KeySecrets', { //we just need to create secrets to store them
      secretName: `${stage}/keys`,
    });

    // Create a security group for the Aurora database
    const databaseSecurityGroup = new ec2.SecurityGroup(this, `${stage}-DatabaseSecurityGroup`, {
      vpc: importedVPC,
      description: 'Security group for Dashboard DB Aurora database',
      allowAllOutbound: true
    });

    // Allow incoming connections from the ECS service security group
    databaseSecurityGroup.addIngressRule(ec2.Peer.ipv4(importedVPC.vpcCidrBlock), ec2.Port.tcp(5432), 'Allow inbound connections from VPC');

    const rdsCluster = new rds.DatabaseCluster(this, `${stage}-dashboard-api-DBCluster`, {
      defaultDatabaseName: `aomsdb`,
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_14_7,
      }),
      credentials: rds.Credentials.fromSecret(databaseSecret),
      instanceProps: {
        vpc: importedVPC,
        securityGroups: [databaseSecurityGroup],
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      },
    });

    const bastionSecurityGroupId = cdk.Fn.importValue(`${stage}-bastion-security-group-id`);

    // Create a reference to the security group
    const bastionSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'BastionSecurityGroup', bastionSecurityGroupId);
    rdsCluster.connections.allowFrom(bastionSecurityGroup, ec2.Port.tcp(5432), 'Allow database connections from bastion host');

    const keysSecretArnOutput = new cdk.CfnOutput(this, 'KeysSecretArnOutput', {
      value: keysSecret.secretArn,
      exportName: `${stage}-keys-secret-arn`, // This is the name by which you can import this value in another stack
    });
  }
}
