import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TenantUserController } from './user.tenant.controller';
import { DatabaseModule } from 'database/database.module';
import { userProviders } from './user.providers';
import { AwsModule } from '../aws/aws.module';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [DatabaseModule, AwsModule, AuthModule, RoleModule],
  controllers: [
    TenantUserController,
  ],
  providers: [UserService, ...userProviders],
  exports: [UserService],
})
export class UserModule {}
