import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { ReferralService } from "./referral.service";
import { PostAmbassadorReferralDto } from "./dto/post-referral-record.dto";

@ApiTags("Referral")
@ApiBearerAuth()
@Controller("campaign")
export class ReferralCampaignController {
  constructor(private readonly referralService: ReferralService) {}
  @Post("referral")
  @UseGuards(AuthGuard)
  async createReferral(@Body() referralData: PostAmbassadorReferralDto) {
    console.log(
      "Create referral request received:",
      JSON.stringify(referralData)
    );

    try {
      const response = await this.referralService.postAmbassadorReferralRecord(
        referralData
      );
      return response;
    } catch (error) {
      console.error("Error creating referral:", error.message);
      throw new HttpException(
        { message: "Failed to create referral", details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
