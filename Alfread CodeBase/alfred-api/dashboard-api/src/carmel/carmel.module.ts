import { forwardRef, Module } from "@nestjs/common";
import { CarmelController } from "./carmel.controller";
import { CarmelService } from "./carmel.service";
import { HotelModule } from "src/hotel/hotel.module";
import { CityModule } from "src/city/city.module";
import { AwsModule } from "src/aws/aws.module";
import { OrderModule } from "src/order/order.module";
import { ORDER_STATUS_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { DataSource } from "typeorm";
import { OrderStatus } from "database/entities/order.entity";
import { DatabaseModule } from "database/database.module";

@Module({
  imports: [HotelModule, CityModule, AwsModule, OrderModule, DatabaseModule],
  controllers: [CarmelController],
  providers: [
    CarmelService,
    {
      provide: ORDER_STATUS_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(OrderStatus),
      inject: [PG_DATA_SOURCE],
    },
  ],
  exports: [CarmelService],
})
export class CarmelModule {}
