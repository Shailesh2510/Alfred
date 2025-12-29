import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    console.log(`
      Make sure to set environment variables
      process.env.STAGE
      process.env.AWS_ACCOUNT
      process.env.AWS_REGION
    `)
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    if (!props?.env?.account) {
      throw new Error(`Account missing`);
    }
    if (!props?.env?.region) {
      throw new Error(`Region missing`);
    }
  }
}
