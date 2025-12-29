import { Module } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { PaymentController } from "./payment.controller";
import { PaymentLogService } from "./payment-log.service";
import { stripeServiceProviders } from "./providers";
import { DatabaseModule } from "database/database.module";
import { OrderModule } from "src/order/order.module";
import { AwsModule } from "src/aws/aws.module";
import { ClicksendService } from "src/notification/clicksend.service";
import { ReferralModule } from "src/referrals/referral.module";

@Module({
  imports: [DatabaseModule, OrderModule, AwsModule, ReferralModule],
  providers: [
    StripeService,
    PaymentLogService,
    ClicksendService,
    ...stripeServiceProviders,
  ],
  exports: [StripeService, PaymentLogService],
  controllers: [PaymentController],
})
export class PaymentModule {}
