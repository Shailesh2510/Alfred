import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { HotelService } from "./hotel.service";
import { CreateHotelDTO } from "./dto/create-hotel.dto";
import { UpdateHotelDTO } from "./dto/update-hotel.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { DEFAULT_SYSTEM_TIMEZONE, RestApiResponse } from "helpers";
import { DetailedHotelMerchant, DetailedHotelVM, HotelVM } from "./vm/hotel.vm";
import { InjectableUser } from "../../database/entities/user.entity";
import { AuthUser } from "../auth/user.decorator";
import { UserType } from "../../database/enums/usertype";
import { CityService } from "../city/city.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  HOTEL_CREATED_EVENT,
  HOTEL_UPDATED_EVENT,
  MERCHANT_HOTEL_ASSIGN_EVENT,
  MERCHANT_HOTEL_UNASSIGN_EVENT,
} from "../../events";
import { MenuService } from "../../src/menu/menu.service";
import { AssignMerchantHotelDTO } from "./dto/assign-merchant-hotel.dto";
import { DetailedMenuVM } from "../../src/menu/vm/menu.vm";
import { APIUpdateMerchantOrderPositionDTO } from "./dto/order-merchant-hotel.dto";

@ApiTags("Hotel (Tenant)")
@Controller("tenant/hotel")
@ApiBearerAuth()
export class TenantHotelController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly cityService: CityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly menuService: MenuService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createHotelDTO: CreateHotelDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.create(createHotelDTO);
    this.eventEmitter.emit(HOTEL_CREATED_EVENT);
    return RestApiResponse(new HotelVM(hotel).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const hotels = await this.hotelService.find();
    const citiesMap = await this.cityService.findAsMap();
    const hotelVMs = hotels.map((hotel) =>
      new HotelVM({
        ...hotel,
        cityName: citiesMap[hotel.cityId]?.name || "",
        timezone: citiesMap[hotel.cityId]?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
      }).build()
    );
    return RestApiResponse(hotelVMs);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: +id,
      },
    });
    const [citiesMap, relatedMerchants] = await Promise.all([
      this.cityService.findAsMap(),
      this.hotelService.findHotelMerchants(+id),
    ]);
    let menu = null;
    try {
      menu = await this.menuService.getDetailedMenu(hotel.menuId, hotel.id);
    } catch (err) {
      //if not associated with merchant it doesn't have a menu
      console.log(`error getting hotel menu: `, err);
    }
    const hotelMerchants = JSON.parse(JSON.stringify(relatedMerchants));
    const merchantsPerMealPeriodByHotel =
      await this.hotelService.getMerchantPerMealPeriodByHotel(hotel.id);
    const merchantsPerMealPeriod =
      await this.hotelService.getMerchantPerMealPeriod(hotel.menuId);
    for (let i = 0; i < relatedMerchants.length; i++) {
      relatedMerchants[i].mealPeriods = [];
      for (let j = 0; j < merchantsPerMealPeriod.length; j++) {
        if (relatedMerchants[i].id == merchantsPerMealPeriod[j].merchant_id) {
          relatedMerchants[i].mealPeriods =
            merchantsPerMealPeriod[j].meal_periods;
          relatedMerchants[i].timezone =
            citiesMap[relatedMerchants[i]?.city_id]?.timezone ?? "";
        }
      }
    }

    for (let i = 0; i < hotelMerchants.length; i++) {
      hotelMerchants[i].mealPeriods = [];
      for (let j = 0; j < merchantsPerMealPeriodByHotel.length; j++) {
        if (
          hotelMerchants[i].id == merchantsPerMealPeriodByHotel[j].merchant_id
        ) {
          hotelMerchants[i].mealPeriods =
            merchantsPerMealPeriodByHotel[j].meal_periods;
          hotelMerchants[i].timezone =
            citiesMap[hotelMerchants[i]?.city_id]?.timezone ?? "";
        }
      }
    }
    return RestApiResponse({
      ...new DetailedHotelVM({
        ...hotel,
        cityName: citiesMap[hotel.cityId]?.name || "",
        relatedMerchants: new DetailedHotelMerchant(relatedMerchants).build(),
        hotelMerchants: hotelMerchants,
        timezone: citiesMap[hotel.cityId]?.timezone || "",
      }).build(),
      menu: menu ? new DetailedMenuVM(menu).build() : null, // we do this because of implicit conversion not working properly
    });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() updateHotelDTO: UpdateHotelDTO
  ) {
    const hotel = await this.hotelService.update(
      {
        id: +id,
      },
      updateHotelDTO
    );
    this.eventEmitter.emit(HOTEL_UPDATED_EVENT);
    return RestApiResponse(new HotelVM(hotel).build());
  }

  @Patch(":hotel_id/assign/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async editAssignMerchantToHotel(
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param("merchant_id") merchantId: string,
    @Body() body: AssignMerchantHotelDTO
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: +hotelId,
      },
    });
    await this.hotelService.editAssignMerchantToHotel(
      +hotelId,
      +merchantId,
      body.mealPeriodIds.map((e) => +e)
    );
    this.eventEmitter.emit(MERCHANT_HOTEL_ASSIGN_EVENT, hotel);
    return RestApiResponse(true);
  }

  @Patch(":hotel_id/unassign/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async editUnassignMerchantFromHotel(
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param("merchant_id") merchantId: string,
    @Body() body: AssignMerchantHotelDTO
  ) {
    const hotel = await this.hotelService.unassignMerchantFromHotel(
      +hotelId,
      +merchantId,
      body.mealPeriodIds.map((e) => +e)
    );
    this.eventEmitter.emit(MERCHANT_HOTEL_UNASSIGN_EVENT, hotel);
    this.eventEmitter.emit(HOTEL_UPDATED_EVENT);
    return RestApiResponse(true);
  }

  @Patch(":hotel_id/order/merchants")
  @UseGuards(AuthGuard)
  async editAssignMerchantsToHotel(
    @Param("hotel_id") hotelId: string,
    @Body() merchants: APIUpdateMerchantOrderPositionDTO[]
  ) {
    try {
      await this.hotelService.editOrderMerchantsPositionToHotel(
        +hotelId,
        merchants
      );

      return RestApiResponse(true);
    } catch (error) {
      console.error("Error updating merchant order:", error);
      throw new Error(
        "Failed to update merchant order. Please try again later."
      );
    }
  }

  @Post("regenerate-hotel-list")
  @UseGuards(AuthGuard)
  async regenerateHotelList(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    await this.hotelService.regenerateHotelList();
    return RestApiResponse(true);
  }
  @Get(":id/similar-hotel-list")
  @UseGuards(AuthGuard)
  async findSimilarHotels(@Param("id") id: string) {
    const hotels = await this.hotelService.findSimilarHotels(+id);

    return RestApiResponse(hotels);
  }
}
