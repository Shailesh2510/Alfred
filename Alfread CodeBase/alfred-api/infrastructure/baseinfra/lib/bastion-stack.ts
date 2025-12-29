import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as AWS from 'aws-sdk';
import { BaseStack } from './base';

export class BastionStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    // The code that defines your stack goes here
    // Import the VPC for the ECS service
    const importedVPC = ec2.Vpc.fromLookup(this, `${stage}-ExportedDashboardApiVPC`, {
      vpcName: `${stage}-dashboard-api-vpc`,
    });

    // Create a security group for the bastion host
    const bastionSecurityGroup = new ec2.SecurityGroup(this, `${stage}-BastionSecurityGroup`, {
      vpc: importedVPC,
      allowAllOutbound: true, // Allow outbound traffic
      securityGroupName: `${stage}-bastion-security-group`
    });

    // Allow SSH (port 22) traffic only from your IP address or trusted network
    // bastionSecurityGroup.addIngressRule(ec2.Peer.ipv4('your-ip-address/32'), ec2.Port.tcp(22), 'Allow SSH access');
    // aws ec2 create-key-pair --region us-east-1 --key-name dev-bastion-key --query 'KeyMaterial' --output text > BastionKey.pem

    // Create an EC2 instance for the bastion host
    const bastionHost = new ec2.Instance(this, `${stage}-BastionHost`, {
      vpc: importedVPC,
      associatePublicIpAddress: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // This ensures the instance is launched in a public subnet
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: bastionSecurityGroup,
      keyName: `${stage}-bastion-key`, // Replace with your key pair name
      instanceName: `${stage}-bastion-host`
    });

    // Output the public IP address of the bastion host
    new cdk.CfnOutput(this, `${stage}-BastionHostPublicIp`, {
      value: bastionHost.instancePublicIp,
      description: 'Public IP address of the bastion host',
    });

    new cdk.CfnOutput(this, `${stage}-BastionSecurityGroupId`, {
      value: bastionSecurityGroup.securityGroupId,
      exportName: `${stage}-bastion-security-group-id`,
    });
  }
}
