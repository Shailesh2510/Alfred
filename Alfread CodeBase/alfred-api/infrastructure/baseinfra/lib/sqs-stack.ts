import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { BaseStack } from './base';

export class SQSStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    // Create the dead-letter queue
    const deadLetterQueue = new sqs.Queue(this, 'OrdersDeadLetterQueue', {
      queueName: `${stage}-order-dead-letter-queue`,
      retentionPeriod: cdk.Duration.days(7),
    });

    // Create the main SQS queue
    const mainQueue = new sqs.Queue(this, 'Messages', {
      queueName: `${stage}-order-queue`,
      retentionPeriod: cdk.Duration.days(7),
      visibilityTimeout: cdk.Duration.seconds(60),
      deadLetterQueue: {
        maxReceiveCount: 10,
        queue: deadLetterQueue,
      },
    });

    new cdk.CfnOutput(this, 'OrderQueueArn', {
      value: mainQueue.queueArn,
      exportName: `${stage}-order-queue-arn`,
    });
  }
}
