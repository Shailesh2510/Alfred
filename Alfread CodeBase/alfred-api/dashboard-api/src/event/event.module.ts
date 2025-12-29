import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DatabaseModule } from "database/database.module";
import { RegenerateMenuEventHandler } from "./regenerate-menu.handler";
import { HotelListEventHandler } from "./hotel-list.handler";
import { AwsModule } from "src/aws/aws.module";
import { HotelModule } from "src/hotel/hotel.module";
import { PublishMenuModule } from "src/publish-menu/publish-menu.module";
import { CityModule } from "src/city/city.module";
import { MenuModule } from "src/menu/menu.module";
import { PublishMenuService } from "src/publish-menu/publish-menu.service";
import { MerchantModule } from "src/merchant/merchant.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    DatabaseModule,
    PublishMenuModule,
    AwsModule,
    HotelModule,
    MenuModule,
    CityModule,
  ],
  providers: [RegenerateMenuEventHandler, HotelListEventHandler,PublishMenuService],
})
export class EventModule {}