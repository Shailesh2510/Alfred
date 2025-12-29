import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { HotelVoucherProgramController } from './voucher_program.hotel.controller';
import { voucherProgramProviders } from './voucher_program.providers';
import { VoucherProgramService } from './voucher_program.service';
import { TenantVoucherProgramController } from './voucher_program.tenant.controller';
import { MealPeriodModule } from '../meal_period/meal_period.module';
import { HotelModule } from '../hotel/hotel.module';
import { MenuCategoryModule } from '../menu_category/menu_category.module';
import { VoucherCodeModule } from 'src/voucher_code/voucher_code.module';

@Module({
  imports: [DatabaseModule, AuthModule, MealPeriodModule, MenuCategoryModule, HotelModule, VoucherCodeModule],
  controllers: [HotelVoucherProgramController, TenantVoucherProgramController],
  providers: [VoucherProgramService, ...voucherProgramProviders],
  exports: [VoucherProgramService]
})
export class VoucherProgramModule {}
