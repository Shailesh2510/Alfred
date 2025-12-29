import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { BaseStack } from './base';

export class EcrStack extends BaseStack {
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

    // Create an ECS cluster in the VPC
    const cluster = new ecs.Cluster(this, `${stage}-dashboard-api-cluster`, {
      vpc: importedVPC,
      clusterName: `${stage}-dashboard-api-cluster`,
    });

    // Create an ECR repository for your Docker image
    const ecrRepository = new ecr.Repository(this, `${stage}-dashboard-api-repository`, {
      repositoryName: `${stage}-dashboard-api-repository`,
    });

    // Export the ECS cluster and task definition ARNs
    new cdk.CfnOutput(this, `${stage}-ECSClusterArn`, {
      value: cluster.clusterArn,
      exportName: `${stage}-ecs-dashboard-api-cluster-arn`,
    });

    new cdk.CfnOutput(this, `${stage}-ECSClusterName`, {
      value: cluster.clusterName,
      exportName: `${stage}-ecs-dashboard-api-cluster-name`,
    });

    new cdk.CfnOutput(this, `${stage}-ECRRepositoryARN`, {
      value: ecrRepository.repositoryArn,
      exportName: `${stage}-ecr-dashboard-api-repository-arn`,
    });
  }
}
