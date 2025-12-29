import { Controller, Get, Param, UseGuards } from "@nestjs/common";import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { PMSService } from "./pms.service";
import { RestApiResponse } from "helpers";

@ApiTags("PMS (Public PMS)")
@Controller("gateway/pms/public")
@ApiBearerAuth()
export class PublicPMSController {
  constructor(private readonly pmsService: PMSService) {}

  @Get(":webCode/:lastName/:roomNumber")
  @UseGuards(ApiKeyGuard)
  async getGuestWithVoucher(
    @Param("webCode") webCode: string,
    @Param("lastName") lastName: string,
    @Param("roomNumber") roomNumber: string
  ) {
    console.log(`PMS payload: ${webCode}, ${lastName}, ${roomNumber}`);

    const integrationResponse = await this.pmsService.getPmsIntegration(
      webCode.trim(),
      lastName.toLowerCase().trim(),
      roomNumber.toLowerCase().trim()
    );
    return RestApiResponse(integrationResponse);
  }
}
