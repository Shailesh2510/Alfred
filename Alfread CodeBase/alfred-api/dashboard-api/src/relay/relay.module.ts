import { Module } from "@nestjs/common";
import { RelayService } from "./relay.service";
import { HTTPModule } from "src/http/http.module";
import { HotelModule } from "src/hotel/hotel.module";
import { RelayController } from "./relay.controller";
import { AwsModule } from "src/aws/aws.module";

@Module({
  imports: [HTTPModule, HotelModule, AwsModule],
  controllers: [RelayController],
  providers: [RelayService],
  exports: [RelayService]
})
export class RelayModule {}
