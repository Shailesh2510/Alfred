import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PERMISSION_REPOSITORY,
  ROLE_PERMISSION_REPOSITORY,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
  USER_ROLE_REPOSITORY,
} from '../../../constants';
import { User, UserRole } from '../../../database/entities/user.entity';
import { Repository } from 'typeorm';
import {
  AuthFlowType,
  CognitoIdentityProvider,
  CreateUserPoolClientCommandOutput,
  CreateUserPoolCommandOutput,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';
import { get } from 'https';
import { IncomingMessage } from 'http';
import { IsString } from 'class-validator';
import { appendFileSync } from 'fs';
import { UserType } from '../../../database/enums/usertype';
import { Role, RolePermission } from '../../../database/entities/role.entity';
import { RoleType } from '../../../database/enums/roletype';
import { Permission } from '../../../database/entities/permission.entity';

const DASHBOARD_POOL_POSTFIX = `dashboard-pool`;
const USER_POOL_POSTFIX = `user-pool`;
const MAIN_CLIENT_ID_POSTFIX = `main-client`;
const DEFAULT_REGION = `us-east-1`;

const cognitoProvider = new CognitoIdentityProvider({
  region: DEFAULT_REGION,
});

export interface ICreateTenantInput {
  name: string;
}

export interface IGetTenantDataInput {
  name: string;
}

export class CreateTenantDTO {
  @IsString()
  name: string;

  @IsString()
  superadminEmail: string;

  @IsString()
  stage: string;
}

@Injectable()
export class SetupTenantService {
  @Inject(USER_REPOSITORY)
  private userRepository: Repository<User>;
  @Inject(ROLE_REPOSITORY)
  private roleRepository: Repository<Role>;
  @Inject(PERMISSION_REPOSITORY)
  private permissionRepository: Repository<Permission>;
  @Inject(ROLE_PERMISSION_REPOSITORY)
  private permissionRoleRepository: Repository<RolePermission>;
  @Inject(USER_ROLE_REPOSITORY)
  private userRoleRepository: Repository<UserRole>;
  private readonly logger = new Logger();

  async create(createTenantDTO: CreateTenantDTO): Promise<void> {
    try {
      const [dashboardPool, userPool] = await this.createUserPools(
        createTenantDTO,
      );
      const [dashboardPoolClient, userPoolClient] =
        await this.createUserPoolClients(
          createTenantDTO.name,
          dashboardPool,
          userPool,
        );
      const [dashboardJwks, guestJwks] = await this.getJWKs(
        dashboardPool,
        userPool,
      );
      let superadminUser = null;
      try {
        await this.createDefaultUser({
          username: createTenantDTO.superadminEmail,
          userPoolId: dashboardPool.UserPool.Id,
        });
        superadminUser = await this.userRepository.save({
          email: createTenantDTO.superadminEmail,
          type: UserType.TENANT_USER,
        });
      } catch (err) {
        await this.cleanUpPools(dashboardPool, userPool);
        throw err;
      }

      if (!superadminUser) {
        throw new Error('Failed to create SUPERADMIN user');
      }
      //create superadmin role
      const superadminRole = await this.roleRepository.save({
        name: 'SUPERADMIN',
        type: RoleType.TENANT_ROLE,
      });
      const permissions = await this.permissionRepository.find();
      const superadminPermissionRoles = permissions.map((permission) => ({
        permissionId: permission.id,
        roleId: superadminRole.id,
      }));
      try {
        await this.permissionRoleRepository.save(superadminPermissionRoles);
        await this.userRoleRepository.save({
          userId: superadminUser.id,
          roleId: superadminRole.id,
        });
      } catch (err) {
        await this.cleanUpPools(dashboardPool, userPool);
        await this.userRepository.delete({
          id: superadminUser.id,
        });
      }

      console.log(
        JSON.stringify({
          dashboardJwks: dashboardJwks,
          guestJwks: guestJwks,
          dashboardPoolId: dashboardPool.UserPool.Id,
          userPoolId: userPool.UserPool.Id,
          dashboardPoolClientId: dashboardPoolClient.UserPoolClient.ClientId,
          userPoolClientId: userPoolClient.UserPoolClient.ClientId,
        }),
      );
      appendFileSync(
        '.env',
        `
#generated values start
DASHBOARD_KEYS=${JSON.stringify(dashboardJwks)}
GUEST_KEYS=${JSON.stringify(guestJwks)}
DASHBOARD_POOL_ID=${dashboardPool.UserPool.Id}
GUEST_POOL_ID=${userPool.UserPool.Id}
DASHBOARD_POOL_CLIENT_ID=${dashboardPoolClient.UserPoolClient.ClientId}
GUEST_POOL_CLIENT_ID=${userPoolClient.UserPoolClient.ClientId}
#generated values end
`,
      );
    } catch (err) {
      this.logger.log('[TenantService@create]: ', err);
    }
  }

  async createUserPools(
    tenantDTO: CreateTenantDTO,
  ): Promise<CreateUserPoolCommandOutput[]> {
    let dashboardPool = null;
    let userPool = null;
    try {
      [dashboardPool, userPool] = await Promise.all([
        cognitoProvider.createUserPool({
          PoolName: `${tenantDTO.stage}-${tenantDTO.name}-${DASHBOARD_POOL_POSTFIX}`,
        }),
        cognitoProvider.createUserPool({
          PoolName: `${tenantDTO.stage}-${tenantDTO.name}-${USER_POOL_POSTFIX}`,
        }),
      ]);
    } catch (err) {
      console.log('[error@createUserPools]', err);
      if (!dashboardPool || !userPool) {
        await this.cleanUpPools(dashboardPool, userPool);
        throw new Error(
          `Unable to create dashboard or user pool: ${JSON.stringify({
            dashboardPool,
            userPool,
          })}`,
        );
      }
    }
    return [dashboardPool, userPool];
  }

  async createUserPoolClients(
    tenantName: string,
    dashboardPool: CreateUserPoolCommandOutput,
    userPool: CreateUserPoolCommandOutput,
  ): Promise<CreateUserPoolClientCommandOutput[]> {
    try {
      return await Promise.all([
        cognitoProvider.createUserPoolClient({
          ClientName: `${tenantName}-${MAIN_CLIENT_ID_POSTFIX}`,
          UserPoolId: dashboardPool.UserPool.Id,
          ExplicitAuthFlows: [AuthFlowType.USER_PASSWORD_AUTH],
        }),
        cognitoProvider.createUserPoolClient({
          ClientName: `${tenantName}-${MAIN_CLIENT_ID_POSTFIX}`,
          UserPoolId: userPool.UserPool.Id,
          ExplicitAuthFlows: [AuthFlowType.USER_PASSWORD_AUTH],
        }),
      ]);
    } catch (err) {
      console.log('[error@createUserPoolClients]', err);
    }
    return [null, null];
  }

  async createDefaultUser(input: { username: string; userPoolId: string }) {
    try {
      return await cognitoProvider.adminCreateUser({
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

  async cleanUpPools(
    dashboardPool: CreateUserPoolCommandOutput,
    userPool: CreateUserPoolCommandOutput,
  ) {
    console.log('CLEANING UP');
    const promises = [];
    if (dashboardPool != null) {
      promises.push(
        cognitoProvider.deleteUserPool({
          UserPoolId: dashboardPool.UserPool.Id,
        }),
      );
    }
    if (userPool != null) {
      promises.push(
        cognitoProvider.deleteUserPool({
          UserPoolId: userPool.UserPool.Id,
        }),
      );
    }
    try {
      return Promise.all(promises);
    } catch (err) {
      console.log('[error@cleanUpPools]: ', err);
    }
  }

  async getJWKs(
    dashboardPool: CreateUserPoolCommandOutput,
    userPool: CreateUserPoolCommandOutput,
  ) {
    try {
      return await Promise.all([
        this.getRequest(
          `https://cognito-idp.${DEFAULT_REGION}.amazonaws.com/${dashboardPool.UserPool.Id}/.well-known/jwks.json`,
        ),
        this.getRequest(
          `https://cognito-idp.${DEFAULT_REGION}.amazonaws.com/${userPool.UserPool.Id}/.well-known/jwks.json`,
        ),
      ]);
    } catch (err) {
      console.log('[error@getJWKs]: ', err);
    }
  }

  async getRequest(url: string) {
    return new Promise((resolve, reject) => {
      get(url, (res: IncomingMessage) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(rawData));
          } catch (err) {
            reject(new Error(err));
          }
        });
      });
    });
  }
}
