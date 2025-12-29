import { Module } from "@nestjs/common";
import { HotelModule } from "../../src/hotel/hotel.module";
import { VoucherCodeModule } from "../../src/voucher_code/voucher_code.module";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { orderProviders } from "./order.providers";
import { OrderService } from "./order.service";
import { ItemModule } from "../../src/item/item.module";
import { ModifierModule } from "../../src/modifier/modifier.module";
import { NotificationModule } from "../../src/notification/notification.module";
import { MerchantModule } from "../../src/merchant/merchant.module";
import { MealPeriodModule } from "../meal_period/meal_period.module";
import { TenantOrderController } from "./order.tenant.controller";
import { MerchantOrderController } from "./order.merchant.controller";
import { HotelOrderController } from "./order.hotel.controller";
import { ExporterModule } from "src/exporter/exporter.module";
import { PublicOrderController } from "./order.public.controller";
import { AwsModule } from "src/aws/aws.module";
import { CityModule } from "src/city/city.module";
import { TransactionManagerModule } from "src/transaction-manager/transaction-manager.module";
import { ShipdayModule } from "src/shipday/shipday.module";
import { RelayModule } from "src/relay/relay.module";
import { HTTPModule } from "src/http/http.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HotelModule,
    CityModule,
    VoucherCodeModule,
    ItemModule,
    ModifierModule,
    NotificationModule,
    MerchantModule,
    MealPeriodModule,
    TransactionManagerModule,
    ExporterModule,
    AwsModule,
    ShipdayModule,
    RelayModule,
    HTTPModule
  ],
  controllers: [
    TenantOrderController,
    MerchantOrderController,
    HotelOrderController,
    PublicOrderController,
  ],
  providers: [OrderService, ...orderProviders],
  exports: [OrderService],
})
export class OrderModule {}
