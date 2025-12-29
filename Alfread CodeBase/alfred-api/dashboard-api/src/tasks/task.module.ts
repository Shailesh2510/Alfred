import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { ScheduleModule } from "@nestjs/schedule";
import { MerchantModule } from "../merchant/merchant.module";
import { OrderModule } from "../order/order.module";
import { OutOfStockModule } from "../out_of_stock/out_of_stock.module";
import { NotificationModule } from "src/notification/notification.module";
import { PaymentModule } from "src/payment/payment.module";
import { CarmelModule } from "src/carmel/carmel.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MerchantModule,
    OrderModule,
    OutOfStockModule,
    NotificationModule,
    PaymentModule,
    CarmelModule,
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
