import { Module } from "@nestjs/common";
import { OrderServiceQueueHandler } from "./order-service-queue.handler";
import {
  AWS_ACCESS_KEY,
  AWS_DEFAULT_REGION,
  AWS_SECRET_ACCESS_KEY,
  ORDER_STATUS_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import { OrderModule } from "../order/order.module";
import { NotificationModule } from "src/notification/notification.module";
import { RelayModule } from "src/relay/relay.module";
import { DataSource } from "typeorm";
import { OrderStatus } from "database/entities/order.entity";
import { DatabaseModule } from "database/database.module";
import { HotelModule } from "src/hotel/hotel.module";
import { MerchantModule } from "src/merchant/merchant.module";
import { CityModule } from "src/city/city.module";
import { PMSModule } from "src/pms/pms.module";
import { TransactionManagerModule } from "src/transaction-manager/transaction-manager.module";
import { ShipdayModule } from "src/shipday/shipday.module";
import { AwsModule } from "src/aws/aws.module";
import { CarmelModule } from "src/carmel/carmel.module";
import { PublishMenuModule } from "src/publish-menu/publish-menu.module";
import { ConciergeModule } from "src/concierge/concierge.module";
import { ConversationsModule } from "src/conversations/conversations.module";
@Module({
  imports: [
    OrderModule,
    NotificationModule,
    RelayModule,
    DatabaseModule,
    HotelModule,
    MerchantModule,
    CityModule,
    PMSModule,
    TransactionManagerModule,
    ShipdayModule,
    AwsModule,
    CarmelModule,
    PublishMenuModule,
    ConciergeModule,
    ConversationsModule,
  ],
  providers: [
    OrderServiceQueueHandler,
    ...[
      {
        provide: ORDER_STATUS_REPOSITORY,
        useFactory: (dataSource: DataSource) =>
          dataSource.getRepository(OrderStatus),
        inject: [PG_DATA_SOURCE],
      },
    ],
  ],
  exports: [OrderServiceQueueHandler],
})
export class QueueModule {}
