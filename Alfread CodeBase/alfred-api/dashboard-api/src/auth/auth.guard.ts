import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify, decode } from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { InjectableUser, InjectableUserVM } from '../../database/entities/user.entity';
import { PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { UserType } from 'database/enums/usertype';

const TOKEN_USE = {
  ID: 'id',
  ACCESS: 'access',
};

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger();
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  private getUserVMQuerybuilder() {
    return this.connection
      .createQueryBuilder()
      .select(
        `
        u.id,
        u.version,
        u.first_name,
        u.last_name,
        u.email,
        u.type,
        uh.hotel_id,
        um.merchant_id
      `,
      )
      .from('users', 'u')
      .leftJoin('user_hotel', 'uh', 'uh.user_id = u.id')
      .leftJoin('user_merchant', 'um', 'um.user_id = u.id');
  }

  private async getInjectableUser(email: string): Promise<InjectableUser> {
    const entity = await this.getUserVMQuerybuilder()
      .where('email = :email')
      .setParameters({
        email,
      })
      .getRawOne();
    return InjectableUserVM.toVM(entity);
  }

  private async permissionExists(
    userId: number,
    path: string,
    method: string,
  ): Promise<boolean> {
    const data = await this.connection
      .createQueryBuilder()
      .select('p.*')
      .from('permissions', 'p')
      .innerJoin('role_permission', 'rp', 'p.id = rp.permission_id')
      .innerJoin('user_role', 'ur', 'rp.role_id = ur.role_id')
      .where(`ur.user_id = :userId`)
      .andWhere(`p.path = :path`)
      .andWhere(`p.method = :method`)
      .setParameters({
        userId: userId,
        path: path.toLowerCase(),
        method: method.toLowerCase(),
      })
      .getRawOne();
    return data != null;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.validateRequest(context.switchToHttp().getRequest());
  }

  async validateRequest(request: any) {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.FORBIDDEN,
      );
    }
    const token = authorization.split(' ')[1];
    const decoded = decode(token);
    const user = await this.getInjectableUser(
      decoded['email'] ?? decoded['username'],
    );
    const clientId = decoded['client_id'];
    const dashboardKeys = JSON.parse(process.env.DASHBOARD_KEYS);

    const isDashboardUser = clientId === process.env.DASHBOARD_POOL_CLIENT_ID;
    if (!isDashboardUser) {
      throw new HttpException('Unknown AuthUser type', HttpStatus.FORBIDDEN);
    }
    if (decoded['token_use'] !== TOKEN_USE.ACCESS) {
      throw new HttpException(
        'Token is not of type Access',
        HttpStatus.FORBIDDEN,
      );
    }
    const key = dashboardKeys.keys[1];

    const permissionExists = await this.permissionExists(
      user.id,
      request.route.path,
      request.method,
    );

    if (!permissionExists) {
      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    }
    this.verifyToken(token, key);
    this.injectUser(user, request);
    return true;
  }

  verifyToken(token: string, key: any) {
    const pem = jwkToPem(key);
    try {
      verify(token, pem, { algorithms: ['RS256'] });
    } catch (err) {
      this.logger.log('AuthGuard@extractFromJWT: ', err);
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }
  }

  injectUser(user: InjectableUser, request: any) {
    if (user.type === UserType.TENANT_USER) {
      user.hotelId = request.query.tenant_mock_hotel_id ?? user.hotelId;
      user.merchantId = request.query.tenant_mock_merchant_id ?? user.merchantId;
    }
    request.user = user;
  }
}
