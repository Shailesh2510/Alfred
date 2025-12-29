import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BaseStack } from './base';

export class S3BucketStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    // Create an S3 bucket with public read access
    const bucket = new s3.Bucket(this, `${stage}-alfredmenu-bucket`, {
      bucketName: `${stage}-alfredmenu-bucket`
    });

    // Define a more restricted CORS policy for the bucket
    // const corsRule: s3.CorsRule = {
    //   allowedMethods: [s3.HttpMethods.GET], // Only allow GET requests
    //   allowedOrigins: ['https://getalfred.com', 'https://www.getalfred.com'], // Allow requests from a specific origin (replace with your actual domain)
    // };

    // Apply the CORS configuration to the bucket
    // bucket.addCorsRule(corsRule);

    // // Define S3 bucket policy
    const bucketPolicy = new s3.CfnBucketPolicy(this, `${stage}-alfredmenu-bucket-policy`, {
      bucket: `${stage}-alfredmenu-bucket`,
      policyDocument: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": `arn:aws:s3:::${stage}-alfredmenu-bucket/*`
          },
          // {
          //   "Effect": "Allow",
          //   "Action": [
          //     "s3:ListBucket",
          //     "s3:GetBucketLocation"
          //   ],
          //   "Resource": `arn:aws:s3:::${stage}-alfredmenu-bucket`
          // },
          {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": `arn:aws:s3:::${stage}-alfredmenu-bucket/*`,
            "Condition": {
              "StringEquals": {
                "aws:Referer": "your-website-origin"
              }
            }
          }
        ]
      }      
    });

    // // Add a statement to the bucket policy
    // bucketPolicy.document.addStatements(
    //   new s3.PolicyStatement({
    //     actions: ['s3:GetObject'],
    //     effect: s3.Effect.ALLOW,
    //     resources: [`${s3Bucket.bucketArn}/*`],
    //     principals: [new s3.ArnPrincipal('arn:aws:iam::123456789012:root')], // Replace with your IAM user or role ARN
    //   })
    // );
  }
}
