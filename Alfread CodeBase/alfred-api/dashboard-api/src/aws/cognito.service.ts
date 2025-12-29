import {
  CognitoIdentityProvider,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, Logger } from '@nestjs/common';
import { AWS_DEFAULT_REGION } from '../../constants';
import { LambdaService } from './lambda.service';

@Injectable()
export class CognitoService {
  private readonly client: CognitoIdentityProvider;
  private readonly logger = new Logger();
  constructor(private readonly lambdaService: LambdaService) {
    this.client = new CognitoIdentityProvider({
      region: AWS_DEFAULT_REGION,
    });
  }

  async createDefaultUser(input: { username: string; userPoolId: string }) {
    try {
      console.log('client: ', this.client);
      console.log('input: ', {
        Username: input.username,
        UserPoolId: input.userPoolId,
        DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
        UserAttributes: [
          {
            Name: 'email',
            Value: input.username,
          },
        ],
      })
      return await this.client.adminCreateUser({
        Username: input.username,
        UserPoolId: input.userPoolId,
        DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
        UserAttributes: [
          {
            Name: 'email',
            Value: input.username,
          },
        ],
      });
    } catch (err) {
      console.log('[error@createDefaultUser]: ', err);
      throw err;
    }
  }

  async updateAttributes(input: { username: string; userPoolId: string }) {
    try {
      this.client.adminUpdateUserAttributes({
        Username: input.username,
        UserPoolId: input.userPoolId,
        UserAttributes: [
          {
            Name: 'email',
            Value: input.username,
          },
        ],
      })
    } catch (err) {
      console.log('[error@verifyAttributes]: ', err);
      throw err;
    }
  }

  async deleteUser(input: {username: string; userPoolId: string}) {
    try {
      await this.client.adminDeleteUser({
        Username: input.username,
        UserPoolId: input.userPoolId,
      })
      return true;
    } catch (err) {
      console.log('[error@deleteUser]: ', err);
    }
    return false;
  }

  async enableDisableUser(input: {username: string; userPoolId: string}, enableDisable = true) {
    try {
      if (enableDisable) {
        await this.client.adminEnableUser({
          Username: input.username,
          UserPoolId: input.userPoolId
        })
      } else {
        await this.client.adminDisableUser({
          Username: input.username,
          UserPoolId: input.userPoolId
        })
      }
    } catch (err) {
      console.log('[error@enableDisableUser]: ', err);
    }
    return false;
  }

  async setUserPassword(input: {username: string; userPoolId: string; password: string; permanent: boolean}) {
    try {
      await this.client.adminSetUserPassword({
        Username: input.username,
        UserPoolId: input.userPoolId,
        Password: input.password,
        Permanent: input.permanent,
      })
    } catch (err) {
      console.log('[error@setUserPassword]: ', err);
    }
  }
} 
