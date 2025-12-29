import {
    Controller,
    Get,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
  } from "@nestjs/common";
  import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
  import { RestApiResponse } from "helpers";
  import { ReferralService } from "./referral.service";
import { ApiKeyGuard } from "src/auth/api-key.guard";
  
  @ApiTags("Referral (Public)")
  @ApiBearerAuth()
  @Controller("gateway/referral/public")
  export class PublicReferralController {
    constructor(private readonly referralService: ReferralService) {}
  
    @Get(":webCode/:code/:airport_code")
    @UseGuards(ApiKeyGuard)
    async fetchPublicReferralDetails(
      @Param("webCode") webCode: string,
      @Param("code") code: string,
      @Param("airport_code") airportCode: string
    ) {
      console.log("Verify Referral triggered with body:", {
        code,
        airportCode,
      });
      try {
        const data = await this.referralService.findByCode(
          webCode,
          airportCode,
          code
        );
        return RestApiResponse(data);
      } catch (error) {
        console.log(`error@fetchReferralDetails: `, error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  