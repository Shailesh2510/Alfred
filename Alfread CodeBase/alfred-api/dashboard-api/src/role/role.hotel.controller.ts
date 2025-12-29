import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { RoleType } from '../../database/enums/roletype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { UserType } from 'database/enums/usertype';
import { RoleVM } from './vm/role.vm';

@ApiTags('Role (Hotel)')
@Controller('role/hotel')
@ApiBearerAuth()
export class HotelRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Body() createRoleDTO: CreateRoleDTO,
  ) {
    const role = await this.roleService.create(
      authUser,
      createRoleDTO,
      RoleType.HOTEL_ROLE,
    );
    return RestApiResponse(new RoleVM(role).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const roles = await this.roleService.findAll(RoleType.HOTEL_ROLE, authUser);
    return RestApiResponse(roles);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const role = await this.roleService.findOne(+id, RoleType.HOTEL_ROLE, authUser);
    return RestApiResponse(new RoleVM(role).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() updateRoleDTO: UpdateRoleDTO,
  ) {
    const role = await this.roleService.update(
      +id,
      +version,
      updateRoleDTO,
      RoleType.HOTEL_ROLE,
      authUser,
    );
    return RestApiResponse(new RoleVM(role).build());
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string
  ) {
    const deleted = this.roleService.remove(+id);
    return RestApiResponse({
      deleted
    });
  }
}
