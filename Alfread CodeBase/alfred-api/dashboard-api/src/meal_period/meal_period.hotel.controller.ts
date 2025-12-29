import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MealPeriodService } from './meal_period.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { DEFAULT_SYSTEM_TIMEZONE, RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { MealPeriodVM } from './vm/meal_period.vm';
import { AuthUser } from '../auth/user.decorator';
import { UserType } from '../../database/enums/usertype';
import { InjectableUser } from '../../database/entities/user.entity';
import { In } from 'typeorm';
import { CityService } from 'src/city/city.service';

@ApiTags('Meal Period (Hotel)')
@Controller('hotel/meal_period')
@ApiBearerAuth()
export class HotelMealPeriodController {
  constructor(
    private readonly mealPeriodService: MealPeriodService,
    private readonly cityService: CityService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const merchants = await this.mealPeriodService.findHotelMerchants(+authUser.hotelId);
    if (merchants?.length == 0) {
      throw new HttpException(`Hotel has no merchant assigned`, HttpStatus.BAD_REQUEST);
    }
    const citiesMap = await this.cityService.findAsMap();
    const merchantsMap = [];
    merchants.forEach(m => merchantsMap[m.id] = m)
    const data = await this.mealPeriodService.find({
      where: {
        id: In(merchants?.map(merchant => merchant.meal_period_id))
      }
    });
    return RestApiResponse(new MealPeriodVM(data.map(d => ({
      ...d,
      merchantName: merchantsMap[d.merchantId]?.name,
      timezone: citiesMap[merchantsMap[d.merchantId]?.city_id]?.timezone ?? '',
    }))).build());
  }
}
