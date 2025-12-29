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
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { InjectableUser } from '../../database/entities/user.entity';
import { AuthUser } from '../auth/user.decorator';
import { UserType } from 'database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { DetailedUserVM, UserVM } from './vm/user.vm';

@ApiTags('User (Hotel)')
@Controller('user/hotel')
@ApiBearerAuth()
export class HotelUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Query() _: TenantImpersonateQueryParams,
    @Body() createUserDTO: CreateUserDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
  ) {
    const data = await this.userService.create(
      authUser,
      createUserDTO,
      UserType.HOTEL_USER,
    );
    return RestApiResponse(new UserVM(data).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const data = await this.userService.findAll(UserType.HOTEL_USER, authUser);
    return RestApiResponse(new UserVM(data).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const data = await this.userService.findOne(+id, UserType.HOTEL_USER, authUser);
    return RestApiResponse(new DetailedUserVM(data).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
  ) {
    const data = await this.userService.update(
      +id,
      updateUserDTO,
      UserType.HOTEL_USER,
      authUser,
    );
    return RestApiResponse(new UserVM(data).build());
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string) {
    const deleted = await this.userService.remove(+id);
    return RestApiResponse({
      deleted
    })
  }
}
