import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ShipdayService } from "./shipday.service";
import { HTTPModule } from "src/http/http.module";
import { ShipdayController } from "./shipday.controller";
import { AwsModule } from "src/aws/aws.module";
import { HotelModule } from "src/hotel/hotel.module";
import { MerchantModule } from "src/merchant/merchant.module";
import { CityModule } from "src/city/city.module";

@Module({
  imports: [
    ConfigModule,
    HTTPModule,
    AwsModule,
    HotelModule,
    MerchantModule,
    CityModule,
  ],
  controllers: [ShipdayController],
  providers: [ShipdayService],
  exports: [ShipdayService],
})
export class ShipdayModule {}
