import * as cdk from "aws-cdk-lib";import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { BaseStack } from "./base";

export class EcsStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    const importedVPC = ec2.Vpc.fromLookup(
      this,
      `${stage}-ExportedDashboardApiVPC`,
      {
        vpcName: `${stage}-dashboard-api-vpc`,
      }
    );

    const orderQueueArn = cdk.Fn.importValue(`${stage}-order-queue-arn`);
    const ecsClusterArn = cdk.Fn.importValue(
      `${stage}-ecs-dashboard-api-cluster-arn`
    );
    const ecsClusterName = cdk.Fn.importValue(
      `${stage}-ecs-dashboard-api-cluster-name`
    );
    const secretsKeysArn = cdk.Fn.importValue(`${stage}-keys-secret-arn`);
    const userPollId = cdk.Fn.importValue(`${stage}-dashboard-pool-id`);
    // Import the ECR repository ARN
    const ecrRepositoryArn = cdk.Fn.importValue(
      `${stage}-ecr-dashboard-api-repository-arn`
    );
    // Use the ARN to create a reference to the SQS queue
    const ordersQueue = sqs.Queue.fromQueueArn(
      this,
      "OrderQueue",
      orderQueueArn
    );

    // Use the ARNs to create references to the ECS cluster and task definition
    const cluster = ecs.Cluster.fromClusterAttributes(
      this,
      "ImportedECSCluster",
      {
        clusterName: ecsClusterName,
        clusterArn: ecsClusterArn,
        vpc: importedVPC,
      }
    );

    // Create a new ECR repository using the imported ARN
    // const ecrRepository = ecr.Repository.fromRepositoryArn(this, 'ImportedECRRepository', ecrRepositoryArn);
    const ecrRepository = ecr.Repository.fromRepositoryAttributes(
      this,
      "ImportedECRRepository",
      {
        repositoryArn: ecrRepositoryArn,
        repositoryName: `${stage}-dashboard-api-repository`,
      }
    );

    // Define the task definition for the ECS service
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      `${stage}-dashboard-api-task-definition`,
      {
        memoryLimitMiB: stage === "prod" ? 4096 : 3072,
        cpu: stage === "prod" ? 2048 : 1024,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
        },
      }
    );

    // Allow ECS task to read from the SQS queue
    ordersQueue.grantConsumeMessages(taskDefinition.taskRole);

    const s3BucketName = `${stage}-alfredmenu-bucket`; // Replace with your S3 bucket name
    const s3Bucket = s3.Bucket.fromBucketName(
      this,
      "ImportedS3Bucket",
      s3BucketName
    );

    s3Bucket.grantDelete(taskDefinition.taskRole);
    s3Bucket.grantReadWrite(taskDefinition.taskRole);

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "MyUserPool",
      userPollId
    );
    const cognitoActions = [
      "cognito-identity:DescribeIdentity",
      "cognito-identity:GetOpenIdToken",
      "cognito-identity:GetCredentialsForIdentity",
      "cognito-identity:ListIdentities",
      "cognito-identity:ListIdentityPools",
      "cognito-identity:UpdateIdentityPool",
      "cognito-identity:DeleteIdentities",
      "cognito-identity:MergeDeveloperIdentities",
      "cognito-identity:GetId",
      "cognito-identity:LookupDeveloperIdentity",
      "cognito-identity:ListTagsForResource",
      // Permissions for Cognito User Pools
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:ListUsers",
      "cognito-idp:AdminGetUser",
      // Permissions for creating and updating data within pools
      "cognito-sync:UpdateRecords",
      "cognito-sync:GetCognitoEvents",
      "cognito-sync:GetDataset",
      "cognito-sync:GetIdentityPoolConfiguration",
      "cognito-sync:SetIdentityPoolConfiguration",
      "cognito-sync:GetBulkPublishDetails",
      "cognito-sync:GetCognitoEvents",
      "cognito-sync:GetIdentityPoolConfiguration",
      "cognito-sync:ListDatasets",
      "cognito-sync:ListIdentityPoolUsage",
      "cognito-sync:ListRecords",
      "cognito-sync:QueryRecords",
    ];
    userPool.grant(taskDefinition.taskRole, ...cognitoActions);

    const existingSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "KeysSecrets",
      `${stage}/keys`
    );
    existingSecret.grantRead(taskDefinition.taskRole);
    const existingEncryptedSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "EncryptedKeysSecrets",
      `${stage}/encrypted-keys`
    );
    existingEncryptedSecret.grantRead(taskDefinition.taskRole);
    // existingSecret.grantWrite(taskDefinition.taskRole);

    // Add a container to the task definition using the Docker image from ECR
    const container = taskDefinition.addContainer(
      `${stage}-dashboard-api-container`,
      {
        image: ecs.ContainerImage.fromEcrRepository(ecrRepository),
        memoryLimitMiB: 1024,
        containerName: `${stage}-dashboard-api-container`,
        portMappings: [
          {
            containerPort: 3000,
            hostPort: 3000,
          },
        ],
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: `${stage}-dashboard-api-service`,
        }), // Enable CloudWatch Logs
      }
    );

    // lets deploy without it and we'll fix it after manually debugging it
    // Create an ECS service with Fargate launch type
    // const service = new ecs.FargateService(this, `${stage}-dashboard-api-service`, {
    //   cluster,
    //   taskDefinition,
    //   serviceName: `${stage}-dashboard-api-service`,
    //   assignPublicIp: true
    // });

    // new cdk.CfnOutput(this, `${stage}-dashboard-api-service-fargate-arn`, {
    //   value: service.serviceArn,
    //   exportName: `${stage}-dashboard-api-service-fargate-arn`
    // });
    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      `${stage}-dashboard-api-service`,
      {
        cluster,
        taskDefinition,
        desiredCount: stage === "prod" ? 2 : 1, // Adjust as needed
        publicLoadBalancer: true, // This will create an internet-facing load balancer
        serviceName: `${stage}-dashboard-api-service`,
        assignPublicIp: true,
      }
    );

    const targetGroup = service.targetGroup;
    targetGroup.configureHealthCheck({
      path: "/health", // Set your desired health check path here
      interval: cdk.Duration.seconds(60), // Optional: Set the health check interval
    });

    const alb = service.loadBalancer;
    const certificateArn = cdk.Fn.importValue(
      `${stage}-alfredapp-certificate-arn`
    );
    // Add listener rules for HTTP (80) and HTTPS (443)
    // alb.addListener('HttpListener', {
    //   port: 80,
    //   protocol: elbv2.ApplicationProtocol.HTTPS,
    //   certificates: [
    //     {
    //       certificateArn
    //     }
    //   ]
    // }).addTargets('HttpTarget', {
    //   port: 3000,
    //   protocol: elbv2.ApplicationProtocol.HTTP
    // });

    const listener = alb.addListener("HttpsListener", {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      defaultAction: elbv2.ListenerAction.fixedResponse(404),
      certificates: [
        {
          certificateArn,
        },
      ],
    });

    listener.addTargets("EcsServiceTarget", {
      port: 80,
      targets: [service.service],
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: "/health",
        interval: cdk.Duration.seconds(60), // Optional: Set the health check interval
      },
    });
    // listener.addTargets('HttpsTarget', {
    //   port: 443,
    //   targets: [service.service],
    //   protocol: elbv2.ApplicationProtocol.HTTPS,
    //   healthCheck: {
    //     path: "/health",
    //     interval: cdk.Duration.seconds(60), // Optional: Set the health check interval
    //   }
    // });
    // .addTargets('HttpsTarget', {
    //   port: 3000,
    //   protocol: elbv2.ApplicationProtocol.HTTP,
    // });
  }
}
