import { Controller, Param, UseGuards, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { MenuCategoryService } from './menu_category.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { HotelService } from '../hotel/hotel.service';

@ApiTags('Menu Category (Hotel)')
@Controller('hotel/menu_category')
@ApiBearerAuth()
export class HotelMenuCategoryController {
  constructor(
    private readonly menuCategoryService: MenuCategoryService,
    private readonly hotelService: HotelService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: authUser.hotelId,
      }
    })
    if (!hotel.menuId) {
      throw new HttpException('Hotel has no menu', HttpStatus.BAD_REQUEST);
    }
    const menuCategories = await this.menuCategoryService.find({
      where: {
        menuId: +hotel?.menuId,
      }
    });
    return RestApiResponse(menuCategories);
  }
}
