import { forwardRef, Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { TenantPermissionController } from './permission.tenant.controller';
import { permissionProviders } from './permission.provider';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TenantPermissionController],
  providers: [PermissionService, ...permissionProviders],
  exports: [PermissionService],
})
export class PermissionModule {}
