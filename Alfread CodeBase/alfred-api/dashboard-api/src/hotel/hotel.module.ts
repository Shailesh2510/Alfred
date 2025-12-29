import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { hotelProviders } from './hotel.providers';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TenantHotelController } from './hotel.tenant.controller';
import { CityModule } from '../city/city.module';
import { HotelController } from './hotel.hotel.controller';
import { MenuModule } from '../../src/menu/menu.module';
import { AwsModule } from 'src/aws/aws.module';
import { PublicHotelController } from './hotel.public.controller';

@Module({
  imports: [DatabaseModule, AuthModule, CityModule, MenuModule, AwsModule],
  controllers: [TenantHotelController, HotelController, PublicHotelController],
  providers: [HotelService, ...hotelProviders],
  exports: [HotelService,...hotelProviders]
})
export class HotelModule {}
