import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from '../auth/auth.module';
import { itemProviders } from './item.providers';
import { AwsModule } from '../aws/aws.module';
import { MealPeriodModule } from '../meal_period/meal_period.module';
import { TenantItemController } from './item.tenant.controller';
import { MerchantItemController } from './item.merchant.controller';

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule, MealPeriodModule],
  controllers: [TenantItemController, MerchantItemController],
  providers: [ItemService, ...itemProviders],
  exports: [ItemService]
})
export class ItemModule {}
