import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { HotelService } from "./hotel.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import {
  DEFAULT_SYSTEM_TIMEZONE,
  RestApiResponse,
  TenantImpersonateQueryParams,
} from "helpers";
import { DetailedHotelMerchant } from "./vm/hotel.vm";
import { InjectableUser } from "../../database/entities/user.entity";
import { AuthUser } from "../auth/user.decorator";
import { UserType } from "../../database/enums/usertype";
import { CityService } from "src/city/city.service";

@ApiTags("Hotel (Hotel)")
@Controller("hotel/hotel")
@ApiBearerAuth()
export class HotelController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly cityService: CityService
  ) {}

  @Get("me")
  @UseGuards(AuthGuard)
  async findAuthHotel(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: +authUser.hotelId,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });
    return RestApiResponse({
      ...hotel,
      timezone: city?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
      userType: authUser.type,
    });
  }

  @Get("merchants")
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: +authUser.hotelId,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });
    const relatedMerchants = await this.hotelService.findHotelMerchants(
      +authUser.hotelId
    );
    let carmelMealPeriodId = null;
    const carmelMerchant = relatedMerchants.filter((merchant: any) => {
      return merchant.merchant_type === "RIDES";
    });

    const merchantsPerMealPeriod =
      await this.hotelService.getMerchantPerMealPeriod(hotel.menuId);
    if (carmelMerchant.length > 0) {
      carmelMealPeriodId = await this.hotelService.getCarmelMealPeriodId(
        carmelMerchant[0].id
      );
    }
    const merchantsMap = {};
    for (let i = 0; i < relatedMerchants.length; i++) {
      relatedMerchants[i].mealPeriods = [];
      for (let j = 0; j < merchantsPerMealPeriod.length; j++) {
        if (relatedMerchants[i].id == merchantsPerMealPeriod[j].merchant_id) {
          relatedMerchants[i].mealPeriods =
            merchantsPerMealPeriod[j].meal_periods;
        }
      }
      merchantsMap[relatedMerchants[i].id] = {
        ...relatedMerchants[i],
        timezone: city?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
        carmelMealPeriodId:
          relatedMerchants[i].merchant_type === "RIDES"
            ? carmelMealPeriodId[0]
            : null,
      };
    }
    return RestApiResponse(
      new DetailedHotelMerchant(Object.values(merchantsMap)).build()
    );
  }
}
