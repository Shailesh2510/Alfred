import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PMSService } from './pms.service';
import { PublicPMSController } from './pms.public.controller';
import { HTTPModule } from 'src/http/http.module';
import { AwsModule } from 'src/aws/aws.module';
import { VoucherProgramModule } from 'src/voucher_program/voucher_program.module';
import { VoucherCodeModule } from 'src/voucher_code/voucher_code.module';

@Module({
  imports: [DatabaseModule, AuthModule, HTTPModule, AwsModule, VoucherProgramModule, VoucherCodeModule],
  controllers: [PublicPMSController],
  providers: [PMSService],
  exports: [PMSService]
})
export class PMSModule {}
