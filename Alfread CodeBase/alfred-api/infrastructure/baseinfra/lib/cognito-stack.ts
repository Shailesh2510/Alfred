import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { BaseStack } from './base';

export class CognitoStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    const userPool = new cognito.UserPool(this, `${stage}-dashboard-pool`, {
      userPoolName: `${stage}-dashboard-pool`,
      selfSignUpEnabled: false,
      signInAliases: { username: true },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireSymbols: true,
        requireUppercase: true,
        requireLowercase: true,
      },
      // standardAttributes: {
      //   email: {
      //     required: true,
      //     mutable: false
      //   }
      // },
    });

    // export userPool.userPoolId
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: userPool.userPoolId,
      exportName: `${stage}-dashboard-pool-id`,
    });
  }
}
