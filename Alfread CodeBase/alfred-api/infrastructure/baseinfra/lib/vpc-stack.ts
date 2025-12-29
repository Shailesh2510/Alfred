import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BaseStack } from './base';

export class VPCStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;
    // The code that defines your stack goes here
    // Create a VPC for the ECS service
    const vpcName = `${stage}-dashboard-api-vpc`
    const vpc = new ec2.Vpc(this, `${stage}-dashboard-api-vpc`, {
      maxAzs: 2, // Specify the maximum number of availability zones
      subnetConfiguration: [
        {
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: `${stage}-dashboard-api-vpc-PrivateSubnet`,
        },
        {
          cidrMask: 24,
          name: `${stage}-dashboard-api-vpc-PublicSubnet`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
      vpcName,
    });

    new cdk.CfnOutput(this, `${stage}-ExportedDashboardApiVPCName`, {
      value: vpcName,
      exportName: `${stage}-dashboard-api-vpc-name`,
    });
  }
}
