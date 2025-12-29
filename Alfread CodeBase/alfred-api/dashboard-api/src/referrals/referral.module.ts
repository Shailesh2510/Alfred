import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AwsModule } from "src/aws/aws.module";
import { ReferralService } from "./referral.service";
import { referralProviders } from "./referral.providers";
import { ReferralCampaignController } from "./referral.campaign.controller";
import { HotelReferralController } from "./referral.hotel.controller";
import { CampaignModule } from "src/campaign/campaign.module";
import { PublicReferralController } from "./referral.public.controller";

@Module({
  imports: [DatabaseModule, AwsModule, CampaignModule],
  controllers: [ReferralCampaignController, HotelReferralController, PublicReferralController],
  providers: [ReferralService, ...referralProviders],
  exports: [ReferralService],
})
export class ReferralModule {}
