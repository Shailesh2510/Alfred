import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { HotelVoucherCodeController } from './voucher_code.hotel.controller';
import { voucherCodeProviders } from './voucher_code.providers';
import { VoucherCodeService } from './voucher_code.service';
import { TenantVoucherCodeController } from './voucher_code.tenant.controller';
import { ExporterModule } from 'src/exporter/exporter.module';
import { PublicVoucherCodeController } from './voucher_code.public.controller';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [DatabaseModule, AuthModule, ExporterModule, AwsModule],
  controllers: [HotelVoucherCodeController, TenantVoucherCodeController, PublicVoucherCodeController],
  providers: [VoucherCodeService, ...voucherCodeProviders],
  exports: [VoucherCodeService]
})
export class VoucherCodeModule {}
