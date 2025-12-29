import { Module } from '@nestjs/common';
import { MenuCategoryService } from './menu_category.service';
import { menuCategoryProviders } from './menu_category.providers';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { MealPeriodModule } from '../meal_period/meal_period.module';
import { MenuModule } from '../menu/menu.module';
import { TenantMenuCategoryController } from './menu_category.tenant.controller';
import { HotelMenuCategoryController } from './menu_category.hotel.controller';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [DatabaseModule, AuthModule, MealPeriodModule, MenuModule, HotelModule],
  controllers: [TenantMenuCategoryController, HotelMenuCategoryController],
  providers: [MenuCategoryService, ...menuCategoryProviders],
  exports: [MenuCategoryService]
})
export class MenuCategoryModule {}
