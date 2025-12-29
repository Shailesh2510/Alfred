import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { campaignProviders } from "./campaign.provider";
import { CampaignService } from "./campaign.service";
import { HotelCampaignController } from "./campaign.hotel.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [HotelCampaignController],
  providers: [CampaignService, ...campaignProviders],
  exports: [CampaignService],
})
export class CampaignModule {}
