import { Module } from "@nestjs/common";
import { ConciergeService } from "./concierge.service";
import { AuthModule } from "../auth/auth.module";
import { ConciergeController } from "./concierge.controller";
import { conciergeProviders } from "./concierge.providers";
import { DatabaseModule } from "database/database.module";
import { ClicksendService } from "src/notification/clicksend.service";
import { AwsModule } from "src/aws/aws.module";

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule],
  controllers: [ConciergeController],
  providers: [ConciergeService, ClicksendService, ...conciergeProviders],
  exports: [ConciergeService],
})
export class ConciergeModule {}
