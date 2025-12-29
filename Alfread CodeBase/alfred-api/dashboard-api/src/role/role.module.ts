import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { TenantRoleController } from './role.tenant.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from 'database/database.module';
import { roleProviders } from './role.providers';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [AuthModule, DatabaseModule, PermissionModule],
  controllers: [
    TenantRoleController,
  ],
  providers: [RoleService, ...roleProviders],
  exports: [RoleService]
})
export class RoleModule {}
