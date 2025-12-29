import { Module } from "@nestjs/common";
import { CityModule } from "./city/city.module";
import { MerchantModule } from "./merchant/merchant.module";
import { HotelModule } from "./hotel/hotel.module";
import { UserModule } from "./user/user.module";
import { RoleModule } from "./role/role.module";
import { PermissionModule } from "./permission/permission.module";
import { AuthModule } from "./auth/auth.module";
import { AwsModule } from "./aws/aws.module";
import { ConfigModule } from "@nestjs/config";
import { ItemModule } from "./item/item.module";
import { ModifierModule } from "./modifier/modifier.module";
import { CategoryModule } from "./category/category.module";
import { MenuModule } from "./menu/menu.module";
import { VoucherCodeModule } from "./voucher_code/voucher_code.module";
import { VoucherProgramModule } from "./voucher_program/voucher_program.module";
import { MealPeriodModule } from "./meal_period/meal_period.module";
import { OrderModule } from "./order/order.module";
import { MenuCategoryModule } from "./menu_category/menu_category.module";
import { MenuItemModule } from "./menu_item/menu_item.module";
import { HealthModule } from "./health/health.module";
import { NotificationModule } from "./notification/notification.module";
import { CachingModule } from "./cache/cache.module";
import { TaskModule } from "./tasks/task.module";
import { EventModule } from "./event/event.module";
import { PaymentModule } from "./payment/payment.module";
import { DiscountCodeModule } from "./discount-code/discount-code.module";
import { QueueModule } from "./queue/queue.module";
import { PublishMenuModule } from "./publish-menu/publish-menu.module";
import { HTTPModule } from "./http/http.module";
import { RelayModule } from "./relay/relay.module";
import { WebhookModule } from "./webhook/webhook.module";
import { PMSModule } from "./pms/pms.module";
import { TransactionManagerModule } from "./transaction-manager/transaction-manager.module";
import { ShipdayModule } from "./shipday/shipday.module";
import { CarmelModule } from "./carmel/carmel.module";
import { ReferralModule } from "./referrals/referral.module";
import { CampaignModule } from "./campaign/campaign.module";
import { ConciergeModule } from "./concierge/concierge.module";
import { ConversationsModule } from "./conversations/conversations.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env` }),
    CityModule,
    MerchantModule,
    HotelModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    AwsModule,
    ItemModule,
    ModifierModule,
    CategoryModule,
    MenuModule,
    PublishMenuModule,
    VoucherProgramModule,
    VoucherCodeModule,
    OrderModule,
    MealPeriodModule,
    MenuCategoryModule,
    MenuItemModule,
    NotificationModule,
    HealthModule,
    CachingModule,
    TaskModule,
    EventModule,
    PaymentModule,
    DiscountCodeModule,
    QueueModule,
    HTTPModule,
    RelayModule,
    WebhookModule,
    PMSModule,
    TransactionManagerModule,
    ShipdayModule,
    CarmelModule,
    ReferralModule,
    CampaignModule,
    ConciergeModule,
    ConversationsModule,
  ],
})
export class AppModule {}
