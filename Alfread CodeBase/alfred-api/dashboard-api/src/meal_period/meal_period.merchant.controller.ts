import {
  Controller,
  Get,
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
import { MerchantService } from 'src/merchant/merchant.service';
import { CityService } from 'src/city/city.service';

@ApiTags('Meal Period (Merchant)')
@Controller('merchant/meal_period')
@ApiBearerAuth()
export class MerchantMealPeriodController {
  constructor(
    private readonly mealPeriodService: MealPeriodService,
    private readonly merchantService: MerchantService,
    private readonly cityService: CityService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const merchant = await this.merchantService.findOne({
      where: {
        id: authUser.merchantId
      }
    })
    const city = await this.cityService.findOne({
      where: {
        id: merchant.cityId
      }
    })
    const data = await this.mealPeriodService.findAll([authUser.merchantId]);
    return RestApiResponse(new MealPeriodVM(data.map(d => ({
      ...d,
      merchantName: merchant.name,
      timezone: city.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
    }))).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.findOne({where: {
      id: +id,
      merchantId: authUser.merchantId
    }});
    return RestApiResponse(new MealPeriodVM(data).build());
  }
}
