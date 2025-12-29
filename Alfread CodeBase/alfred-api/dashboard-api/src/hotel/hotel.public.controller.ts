import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { HotelService } from "./hotel.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DEFAULT_SYSTEM_TIMEZONE, RestApiResponse } from "helpers";
import { PublicHotelDetailsVM, PublicHotelVM } from "./vm/hotel.vm";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { CityService } from "src/city/city.service";
import { FindHotelByHotelNameDTO } from "./dto/find-hotel.dto";

@ApiTags("Hotel (Public Hotel)")
@Controller("gateway/hotel/public")
@ApiBearerAuth()
export class PublicHotelController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly cityService: CityService
  ) {}

  @Get(":uuid")
  @UseGuards(ApiKeyGuard)
  async findOne(@Param("uuid") uuid: string) {
    const hotel = await this.hotelService.findOne({
      where: {
        _id: uuid,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });
    const mealPeriods = await this.hotelService.getHotelMealPeriods(hotel.id);
    const hotelVM = new PublicHotelVM(hotel).build();
    return RestApiResponse({
      ...hotelVM,
      mealPeriods,
      timezone: city?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
    });
  }

  @Post("/hotel-details")
  @UseGuards(ApiKeyGuard)
  async findHotelByHotelName(@Body() findHotelDTO: FindHotelByHotelNameDTO) {
    const hotel = await this.hotelService.findHotelByHotelName(
      findHotelDTO.hotelName
    );
    console.log(`Hotel Response : ${JSON.stringify(hotel)}`);

    if (!hotel || Object.keys(hotel).length === 0) {
      throw new NotFoundException(
        `Hotel with name "${findHotelDTO.hotelName}" not found`
      );
    }

    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });

    const hotelVM = new PublicHotelDetailsVM(hotel).build();
    return RestApiResponse({
      ...hotelVM,
      cityName: city?.name,
      timezone: city?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
    });
  }

  @Get("/hotel-details/:webCode")
  @UseGuards(ApiKeyGuard)
  async findOneByWebCode(@Param("webCode") webCode: string) {
    const hotel = await this.hotelService.findOne({
      where: {
        webCode: webCode,
        isActive: true,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });
    const mealPeriods = await this.hotelService.getHotelMealPeriods(hotel.id);
    const hotelVM = new PublicHotelVM(hotel).build();
    return RestApiResponse({
      ...hotelVM,
      mealPeriods,
      cityName: city?.name,
      timezone: city?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
    });
  }

  @Get("get-merchants/:webCode")
  @UseGuards(ApiKeyGuard)
  async getAllMerchants(@Param("webCode") webCode: string) {
    console.log(`getAllMerchants triggered with `, webCode);
    try {
      if (!webCode) {
        throw new HttpException("Invalid web code", HttpStatus.BAD_REQUEST);
      }
      const hotel = await this.hotelService.findOne({
        where: {
          webCode: webCode,
          isActive: true,
        },
      });
      if (!hotel) {
        throw new HttpException("Hotel not found", HttpStatus.BAD_REQUEST);
      }
      const merchants = await this.hotelService.getAllActiveMerchants(hotel.id);
      console.log(`merchants: `, JSON.stringify(merchants));

      return RestApiResponse(merchants);
    } catch (error) {
      console.log(`error@getAllMerchants: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("get-mealperiods/:merchantId")
  @UseGuards(ApiKeyGuard)
  async getAllMealPeriods(@Param("merchantId") merchantId: string) {
    console.log(`getAllMealPeriods triggered with `, merchantId);
    try {
      if (!merchantId) {
        throw new HttpException("Invalid merchant Id", HttpStatus.BAD_REQUEST);
      }
      const merchants = await this.hotelService.getCarmelMealPeriodId(
        +merchantId
      );

      return RestApiResponse(merchants);
    } catch (error) {
      console.log(`error@getAllMerchants: `, error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
