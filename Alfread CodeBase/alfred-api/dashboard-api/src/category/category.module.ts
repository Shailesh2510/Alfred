import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MerchantCategoryController } from './category.merchant.controller';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { categoryProviders } from './category.providers';
import { MealPeriodModule } from '../meal_period/meal_period.module';

@Module({
  imports: [DatabaseModule, AuthModule, MealPeriodModule],
  controllers: [MerchantCategoryController],
  providers: [CategoryService, ...categoryProviders],
  exports: [CategoryService]
})
export class CategoryModule {}
