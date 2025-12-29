import {
  AppConfigDataClient,
  StartConfigurationSessionCommand,
  GetLatestConfigurationCommand,
} from "@aws-sdk/client-appconfigdata";
import { AWS_DEFAULT_REGION } from "../../constants";
import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class AppConfigService {
  private readonly client: AppConfigDataClient;
  private readonly logger = new Logger(AppConfigService.name);

  constructor() {
    this.client = new AppConfigDataClient({
      region: AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async fetchFeatureFlagValue(featureFlagKey: string) {
    const featureFlagsObject = await this.initializeAwsAppConfigfetch();
    if (featureFlagsObject[featureFlagKey]?.enabled) {
      return featureFlagsObject[featureFlagKey].value;
    }
    return false;
  }

  async initializeAwsAppConfigfetch() {
    let initialToken: string | undefined;

    try {
      const startSessionCommand = new StartConfigurationSessionCommand({
        ApplicationIdentifier: process.env.AWS_APP_CONFIG_APPLICATION_ID!,
        EnvironmentIdentifier: process.env.AWS_APP_CONFIG_ENVIRONMENT_ID!,
        ConfigurationProfileIdentifier:
          process.env.AWS_APP_CONFIG_CONFIGURATION_PROFILE_ID!,
      });
      const sessionResponse = await this.client.send(startSessionCommand);

      if (!sessionResponse.InitialConfigurationToken) {
        throw new Error("Failed to retrieve initial configuration token.");
      }

      initialToken = sessionResponse.InitialConfigurationToken;

      const getConfigCommand = new GetLatestConfigurationCommand({
        ConfigurationToken: initialToken,
      });
      const configResponse = await this.client.send(getConfigCommand);

      const configData = configResponse.Configuration
        ? JSON.parse(new TextDecoder().decode(configResponse.Configuration))
        : null;

      this.logger.log("Successfully fetched feature flags configuration.");

      initialToken = undefined;

      return configData;
    } catch (error) {
      this.logger.error("Error fetching configuration:", error);
      throw new HttpException(
        "Failed to fetch feature flags",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
