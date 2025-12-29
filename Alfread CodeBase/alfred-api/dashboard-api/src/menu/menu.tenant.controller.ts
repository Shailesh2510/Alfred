import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDTO } from './dto/create-menu.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { DetailedMenuVM, MenuVM } from './vm/menu.vm';

@ApiTags('Menu (Tenant)')
@Controller('tenant/menu')
@ApiBearerAuth()
export class TenantMenuController {
  constructor(
    private readonly menuService: MenuService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createMenuDTO: CreateMenuDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menu = await this.menuService.create(createMenuDTO);
    return RestApiResponse(new MenuVM(menu).build());
  }

  @Get('hotel/:hotelId')
  @UseGuards(AuthGuard)
  async findByHotel(
    @Param('hotelId') hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menu = await this.menuService.findByHotelId(+hotelId);
    return RestApiResponse(new MenuVM(menu).build());
  }

  @Get(':id/detailed/hotel/:hotel_id')
  @UseGuards(AuthGuard)
  async getDetailedMenu(
    @Param('id') id: string,
    @Param('hotel_id') hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menu = await this.menuService.getDetailedMenu(+id, +hotelId);
    return RestApiResponse(new DetailedMenuVM(menu).build());
  }
}
