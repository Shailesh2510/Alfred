
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Injectable, Logger } from "@nestjs/common";
import { AWS_DEFAULT_REGION } from "../../constants";

@Injectable()
export class SecretsService {
  private readonly client: SecretsManagerClient;
  private readonly logger = new Logger();
  constructor() {
    this.client = new SecretsManagerClient({
      region: AWS_DEFAULT_REGION,
    });
  }

  async getSecretValue(secret: string) {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secret,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
      return response.SecretString;
    } catch (error) {
      this.logger.log(`[Could not retrieve secrets]: ${error}`)
    }
  }
}
