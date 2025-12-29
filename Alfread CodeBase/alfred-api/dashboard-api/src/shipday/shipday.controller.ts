import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ShipdayService } from "./shipday.service";
import { RestApiResponse } from "helpers";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";

@ApiTags("Shipday")
@Controller("gateway/shipday")
@ApiBearerAuth()
export class ShipdayController {
  constructor(private readonly shipdayService: ShipdayService) {}

  @Get("get-delivery-fees/:hotelId/:merchantId")
  @UseGuards(ApiKeyGuard)
  async getDeliveryFees(
    @Param("hotelId") hotelId: string,
    @Param("merchantId") merchantId: string
  ) {
    console.log(
      `getDeliveryFees triggered with hotelId: ${hotelId}, merchantId: ${merchantId}`
    );
    try {
      const deliveryOption = await this.shipdayService.checkAvailability(
        hotelId,
        +merchantId
      );
      console.log(`deliveryOption: `, JSON.stringify(deliveryOption));
      return RestApiResponse(deliveryOption);
    } catch (error) {
      console.log(`error@getDeliveryFees: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
