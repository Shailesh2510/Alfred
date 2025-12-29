import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import { BaseStack } from './base';

export class EncryptedRDSStack extends BaseStack {
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
    const databaseSecret = new secretsmanager.Secret(this, `${stage}-encrypted-dashboard-db-secret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'alfred' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 36,
      },
      secretName: `${stage}/encrypted-db`
    });

    const keysSecret = new secretsmanager.Secret(this, 'KeySecrets', { //we just need to create secrets to store them
      secretName: `${stage}/encrypted-keys`,
    });

    // Create a security group for the Aurora database
    const databaseSecurityGroup = new ec2.SecurityGroup(this, `${stage}-EncryptedDatabaseSecurityGroup`, {
      vpc: importedVPC,
      description: 'Security group for Dashboard DB Aurora database',
      allowAllOutbound: true
    });

    // Allow incoming connections from the ECS service security group
    databaseSecurityGroup.addIngressRule(ec2.Peer.ipv4(importedVPC.vpcCidrBlock), ec2.Port.tcp(5432), 'Allow inbound connections from VPC');

    const kmsKey = new kms.Key(this, `${stage}-DashboardDBEncryptionKey`, {
      enableKeyRotation: true,
      description: 'Dashboard DB KMS key for encrypting RDS storage',
    });

    const rdsCluster = new rds.DatabaseCluster(this, `${stage}-encrypted-dashboard-api-DBCluster`, {
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
      storageEncryptionKey: kmsKey,
      backup: {
        retention: cdk.Duration.days(3),
      }
    });

    const bastionSecurityGroupId = cdk.Fn.importValue(`${stage}-bastion-security-group-id`);

    // Create a reference to the security group
    const bastionSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'BastionSecurityGroup', bastionSecurityGroupId);
    rdsCluster.connections.allowFrom(bastionSecurityGroup, ec2.Port.tcp(5432), 'Allow database connections from bastion host');

    const keysSecretArnOutput = new cdk.CfnOutput(this, 'KeysSecretArnOutput', {
      value: keysSecret.secretArn,
      exportName: `${stage}-encrypted-keys-secret-arn`, // This is the name by which you can import this value in another stack
    });
  }
}
