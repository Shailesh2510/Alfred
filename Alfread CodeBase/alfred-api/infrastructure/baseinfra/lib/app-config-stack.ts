import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as appconfig from "aws-cdk-lib/aws-appconfig";
import { BaseStack } from "./base";

export class AppConfigStack extends BaseStack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props.tags.stage;
    const appConfigDetails = {
      applicationName: `${stage}-default-application`,
      environments: [`${stage}-default-environment`],
    };

    // Create AppConfig Application
    const appConfigApplication = new appconfig.CfnApplication(
      this,
      "AppConfigApplication",
      {
        name: appConfigDetails.applicationName,
        description: `AppConfig application for ${stage}`,
      }
    );

    // Loop through environments and create each in AppConfig
    for (const envName of appConfigDetails.environments) {
      new appconfig.CfnEnvironment(this, `AppConfigEnvironment-${envName}`, {
        applicationId: appConfigApplication.ref,
        name: envName,
        description: `AppConfig environment for ${envName}`,
      });
    }

    // Create a Configuration Profile for each environment
    const configProfile = new appconfig.CfnConfigurationProfile(
      this,
      "AppConfigProfile",
      {
        applicationId: appConfigApplication.ref,
        name: `${stage}-config-profile`,
        locationUri: "hosted", // AWS-hosted configuration
        type: "AWS.Freeform",
        description: "Configuration profile for application settings",
      }
    );

    // Create Deployment Strategy
    new appconfig.CfnDeploymentStrategy(this, "DeploymentStrategy", {
      name: `${stage}-deployment-strategy`,
      deploymentDurationInMinutes: 1,
      growthFactor: 50,
      growthType: "LINEAR",
      replicateTo: "NONE",
    });
  }
}
