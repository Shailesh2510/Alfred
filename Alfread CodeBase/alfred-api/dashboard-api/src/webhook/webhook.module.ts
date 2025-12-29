import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { WebhookController } from "./webhook.controller";
import { AuthModule } from "src/auth/auth.module";
import { AwsModule } from "src/aws/aws.module";
import { ConversationsModule } from "src/conversations/conversations.module";
import { ClicksendService } from "src/notification/clicksend.service";

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule, ConversationsModule],
  controllers: [WebhookController],
  providers: [ClicksendService],
})
export class WebhookModule {}
