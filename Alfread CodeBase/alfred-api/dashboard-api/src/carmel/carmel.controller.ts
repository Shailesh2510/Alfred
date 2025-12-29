import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { RestApiResponse } from "helpers";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { PriceListDto } from "./dto/price-list.dto";
import { CarmelService } from "./carmel.service";
import { CreateTripDto } from "./dto/create-trip.dto";

@ApiTags("Carmel")
@Controller("gateway/carmel")
@ApiBearerAuth()
export class CarmelController {
  constructor(private readonly carmelService: CarmelService) {}

  @Post("get-price-list/:webCode")
  @UseGuards(ApiKeyGuard)
  async getPriceList(
    @Param("webCode") webCode: string,
    @Body() priceListDto: PriceListDto
  ) {
    console.log(
      "Get Carmel Price List triggered with body:",
      JSON.stringify(priceListDto)
    );
    try {
      const priceList = await this.carmelService.getPriceList(
        webCode,
        priceListDto
      );
      return RestApiResponse(priceList);
    } catch (error) {
      console.log(`error@getPriceList: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("post-trip/:webCode")
  @UseGuards(ApiKeyGuard)
  async createTrip(
    @Param("webCode") webCode: string,
    @Body() createTripDto: CreateTripDto
  ) {
    console.log(
      "Create Trip with carmel triggered with body:",
      JSON.stringify(createTripDto)
    );
    try {
      const tripUpdateResponse = await this.carmelService.updateTrip(
        webCode,
        createTripDto
      );
      return RestApiResponse(tripUpdateResponse);
    } catch (error) {
      console.log(`error@post-trip: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("cancel-trip/:webCode")
  @UseGuards(ApiKeyGuard)
  async cancelTrip(
    @Param("webCode") webCode: string,
    @Param("orderId") orderId: string
  ) {
    console.log(
      "Cancel Trip with carmel triggered with body:",
      JSON.stringify({ webCode: webCode, orderId: orderId })
    );
    try {
      const cancelTripResponse = await this.carmelService.cancelTrip(+orderId);
      return RestApiResponse(cancelTripResponse);
    } catch (error) {
      console.log(`error@cancel-trip: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("car-location/:nonce")
  @UseGuards(ApiKeyGuard)
  async fetchCarLocationByNonce(@Param("nonce") nonce: string) {
    try {
      const carmelTripResponse =
        await this.carmelService.fetchCarLocationByNonce(nonce);
      return carmelTripResponse;
    } catch (error) {
      console.log(`error@car-location: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("trip/:nonce")
  @UseGuards(ApiKeyGuard)
  async fetchTripInformationByNonce(@Param("nonce") nonce: string) {
    try {
      const carmelTripResponse =
        await this.carmelService.fetchTripInformationByNonce(nonce);
      return carmelTripResponse;
    } catch (error) {
      console.log(`error@trip0details: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
