import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TenantCreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO, UpdateUserPasswordDTO } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { DetailedUserVM, UserVM } from './vm/user.vm';

@ApiTags('User (Tenant)')
@Controller('tenant/user')
@ApiBearerAuth()
export class TenantUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createUserDTO: TenantCreateUserDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
  ) {
    const data = await this.userService.create(
      authUser,
      createUserDTO,
      UserType.TENANT_USER,
    );
    return RestApiResponse(new UserVM(data).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.userService.findAll(UserType.TENANT_USER, authUser);
    return RestApiResponse(new UserVM(data).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string, @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.userService.findOne(+id, UserType.TENANT_USER, authUser);
    return RestApiResponse(new DetailedUserVM(data).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
  ) {
    const data = await this.userService.update(
      +id,
      updateUserDTO,
      UserType.TENANT_USER,
      authUser,
    );
    return RestApiResponse(new UserVM(data).build());
  }

  @Patch(':id/credentials')
  @UseGuards(AuthGuard)
  async setUserPassword(
    @Param('id') id: string,
    @Body() dto: UpdateUserPasswordDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
  ) {
    await this.userService.setUserPassword(+id, dto);
    return RestApiResponse({});
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const deleted = await this.userService.remove(+id);
    return RestApiResponse({
      deleted
    })
  }
}
