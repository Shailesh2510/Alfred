import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from 'database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { AccessType } from '../route.interface';
import { PermissionService } from './permission.service';
import { PermissionVM } from './vm/permission.vm';

@ApiTags('Permission (Tenant)')
@Controller('tenant/permission')
@ApiBearerAuth()
export class TenantPermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  
  @Get()
  @UseGuards(AuthGuard)
  async findAll(@AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const permissions = await this.permissionService.findAll(AccessType.TENANT, authUser);
    return RestApiResponse(new PermissionVM(permissions).build())
  }
}
