import { InvocationType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Injectable, Logger } from '@nestjs/common';
import { AWS_DEFAULT_REGION } from "../../constants";
import {
  CognitoIdentityProvider,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class LambdaService {
  private readonly client: LambdaClient;
  private readonly logger = new Logger();
  constructor() {
    this.client = new LambdaClient({
      region: AWS_DEFAULT_REGION,
    });
  }

  async invoke(
    fnName: string,
    payload: { [key: string]: any },
  ): Promise<Uint8Array | undefined[]> {
    try {
      const response = await this.client.send(
        new InvokeCommand({
          FunctionName: fnName,
          Payload: Buffer.from(JSON.stringify(payload)),
          InvocationType: InvocationType.RequestResponse
        }),
      );
      return response.Payload;
    } catch (err) {
      this.logger.log('[LambdaService@invoke]', err);
    }
    return [];
  }
}
