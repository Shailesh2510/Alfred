import { Module } from '@nestjs/common';
import { roleProviders } from '../../role/role.providers';
import { DatabaseModule } from '../../../database/database.module';
import { userProviders } from '../../user/user.providers';
import { SetupTenantService } from './setup-tenant';
import { permissionProviders } from '../../permission/permission.provider';

@Module({
  imports: [DatabaseModule],
  providers: [
    SetupTenantService,
    ...userProviders,
    ...roleProviders,
    ...permissionProviders,
  ],
})
export class SetupTenantModule {}
