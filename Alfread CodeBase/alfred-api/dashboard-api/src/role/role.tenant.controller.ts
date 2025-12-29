import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RoleType } from '../../database/enums/roletype';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { RestApiResponse } from 'helpers';
import { UserType } from 'database/enums/usertype';
import { RoleVM } from './vm/role.vm';

@ApiTags('Role (Tenant)')
@Controller('tenant/role')
@ApiBearerAuth()
export class TenantRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() createRoleDTO: CreateRoleDTO,
  ) {
    const role = await this.roleService.create(
      authUser,
      createRoleDTO,
      RoleType.TENANT_ROLE,
    );
    return RestApiResponse(new RoleVM(role).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const roles = await this.roleService.findAll(RoleType.TENANT_ROLE, authUser);
    return RestApiResponse(new RoleVM(roles).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const role = await this.roleService.findOne(+id, RoleType.TENANT_ROLE, authUser);
    return RestApiResponse(new RoleVM(role).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() updateRoleDTO: UpdateRoleDTO,
  ) {
    const role = await this.roleService.update(
      +id,
      +version,
      updateRoleDTO,
      RoleType.TENANT_ROLE,
      authUser,
    );
    return RestApiResponse(new RoleVM(role).build());
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    const deleted = await this.roleService.remove(+id);
    return RestApiResponse({
      deleted
    });
  }
}
