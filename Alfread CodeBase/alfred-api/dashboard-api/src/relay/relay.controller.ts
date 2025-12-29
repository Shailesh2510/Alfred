import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    UseGuards,
  } from "@nestjs/common";
  import { RelayService } from "./relay.service";
  import { RestApiResponse } from "helpers";
  import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
  import { ApiKeyGuard } from "src/auth/api-key.guard";
  
  @ApiTags("Relay")
  @Controller("gateway/relay")
  @ApiBearerAuth()
  export class RelayController {
    constructor(private readonly relayService: RelayService) {}
  
    @Get("quote")
    @UseGuards(ApiKeyGuard)
    async getDeliveryQuote(
      @Query("hotelWebCode") hotelWebCode: string,
      @Query("merchantId") merchantId: number
    ) {
      console.log(
        `getDeliveryQuote triggered with hotelWebCode: ${hotelWebCode}, merchantId: ${merchantId}`
      );
      try {
        const deliveryOption = await this.relayService.getQuote(
          merchantId,
          hotelWebCode
        );
        console.log(`deliveryOption: `, JSON.stringify(deliveryOption));
        return RestApiResponse(deliveryOption);
      } catch (error) {
        console.log(`error@getQuote: `, error);
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
    }
  }
