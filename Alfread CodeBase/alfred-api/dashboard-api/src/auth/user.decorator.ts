import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from 'database/enums/usertype';

export const AuthUser = createParamDecorator(
  (type: UserType, ctx: ExecutionContext): InjectableUser => {
    const request = ctx.switchToHttp().getRequest();
    // console.log('log@AuthUser:', request.user);
    if (!request.user) {
      throw new HttpException('User not authorized', HttpStatus.UNAUTHORIZED)
    }
    if (type === UserType.MERCHANT_USER && !request.user.merchantId) {
      throw new HttpException('Forbidden for non-merchant users', HttpStatus.FORBIDDEN)
    }
    if (type === UserType.HOTEL_USER && !request.user.hotelId) {
      throw new HttpException('Forbidden for non-hotel users', HttpStatus.FORBIDDEN)
    }
    if (type === UserType.TENANT_USER && !request.user.type) {
      throw new HttpException('Forbidden for unspecified users', HttpStatus.FORBIDDEN)
    }
    return request.user;
  },
);

const getMethods = (obj: any) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function' && item !== "constructor")
