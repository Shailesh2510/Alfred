import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { TenantDiscountCodeController } from './discount-code.tenant.controller';
import { DiscountCodeService } from './discount-code.service';
import { discountCodeProviders } from './discount-code.providers';
import { PublicDiscountCodeController } from './discount-code.public.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule],
  controllers: [TenantDiscountCodeController, PublicDiscountCodeController],
  providers: [DiscountCodeService, ...discountCodeProviders],
  exports: [DiscountCodeService]
})
export class DiscountCodeModule {}
