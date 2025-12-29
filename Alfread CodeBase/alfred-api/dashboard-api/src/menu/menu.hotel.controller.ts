import { Controller, Get, HttpException, HttpStatus, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { DetailedMenuVM } from './vm/menu.vm';
import { HotelService } from '../hotel/hotel.service';
import { Repository } from 'typeorm';
import { Hotel } from 'database/entities/hotel.entity';
import { HOTEL_REPOSITORY } from '../../constants';

@ApiTags('Menu (Hotel)')
@Controller('hotel/menu')
@ApiBearerAuth()
export class HotelMenuController {

  @Inject(HOTEL_REPOSITORY)
  private readonly hotelRepository: Repository<Hotel>;
  constructor(
    private readonly menuService: MenuService,
  ) {}

  @Get('detailed')
  @UseGuards(AuthGuard)
  async getDetailedMenu(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelRepository.findOne({
      where: {
        id: authUser.hotelId,
      }
    })
    if (!hotel) {
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    }
    if (!hotel?.menuId) {
      throw new HttpException('Hotel has no menu', HttpStatus.BAD_REQUEST);
    }
    const menu = await this.menuService.getDetailedMenu(+hotel?.menuId, authUser.hotelId);
    return RestApiResponse(new DetailedMenuVM(menu).build());
  }
}
