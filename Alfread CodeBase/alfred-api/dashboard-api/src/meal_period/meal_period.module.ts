import { Module } from '@nestjs/common';
import { mealPeriodProviders } from './meal_period.providers';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TenantMealPeriodController } from './meal_period.tenant.controller';
import { MealPeriodService } from './meal_period.service';
import { categoryProviders } from '../category/category.providers';
import { HotelMealPeriodController } from './meal_period.hotel.controller';
import { MerchantMealPeriodController } from './meal_period.merchant.controller';
import { MerchantModule } from 'src/merchant/merchant.module';
import { CityModule } from 'src/city/city.module';

@Module({
  imports: [DatabaseModule, AuthModule, MerchantModule, CityModule],
  controllers: [TenantMealPeriodController, HotelMealPeriodController, MerchantMealPeriodController],
  providers: [MealPeriodService, ...mealPeriodProviders, ...categoryProviders],
  exports: [MealPeriodService]
})
export class MealPeriodModule {}
