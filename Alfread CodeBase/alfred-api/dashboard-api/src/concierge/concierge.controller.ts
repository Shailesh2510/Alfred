import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ConciergeService } from "./concierge.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { RestApiResponse } from "helpers";
import { CreateConciergeRequestDTO } from "./dto/create-concierge-request.dto";

@ApiTags("Concierge")
@Controller("concierge")
@ApiBearerAuth()
export class ConciergeController {
  constructor(private readonly conciergeService: ConciergeService) {}

  @Post("guest-request")
  @UseGuards(ApiKeyGuard)
  async postGuest(
    @Body() createConciergeRequestDTO: CreateConciergeRequestDTO
  ) {
    const subscription = await this.conciergeService.createConciergeRequest(
      createConciergeRequestDTO
    );

    return subscription;
  }

  @Post("bulk-message")
  @UseGuards(ApiKeyGuard)
  async postBulkMessage(@Body() bulkMessageDTO: any) {
    const subscription = await this.conciergeService.sendBulkMessage(
      bulkMessageDTO
    );

    return RestApiResponse(subscription);
  }
}
