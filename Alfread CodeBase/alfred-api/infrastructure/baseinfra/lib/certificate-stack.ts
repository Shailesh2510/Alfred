import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { BaseStack } from './base';

export class CertificateStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;

    // Create an SSL certificate in the US East (N. Virginia) region
    const certificate = new acm.Certificate(this, 'GetAlfredCertificate', {
      domainName: stage == 'prod' ? 'api.getalfred.com' : `${stage}.api.getalfred.com`,
      validation: acm.CertificateValidation.fromDns(),
      certificateName: `getalfred-certificate`
    });

    // Create an SSL certificate in the US East (N. Virginia) region
    const certificateForPublicRoutes = new acm.Certificate(this, 'OpenGetAlfredCertificate', {
      domainName: stage == 'prod' ? 'open.getalfred.com' : `${stage}.open.getalfred.com`,
      validation: acm.CertificateValidation.fromDns(),
      certificateName: `open-getalfred-certificate`
    });

    // Output the ARN of the certificate
    new cdk.CfnOutput(this, 'AlfredCertificateArn', {
      value: certificate.certificateArn,
      exportName: `${stage}-alfredapp-certificate-arn`
    });
  }
}
