import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { CreateMerchantDTO } from "./dto/create-merchant.dto";
import { UpdateMerchantDTO } from "./dto/update-merchant.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import {
  DEFAULT_SYSTEM_TIMEZONE,
  getImageUrl,
  getMenuS3Bucket,
  getMerchantCoverImageS3Name,
  getMerchantImageS3Name,
  RestApiResponse,
} from "helpers";
import { MerchantVM } from "./vm/merchant.vm";
import { CityService } from "../city/city.service";
import { UpdateMerchantStatusDTO } from "./dto/update-merchant-status.dto";
import { AuthUser } from "../../src/auth/user.decorator";
import { UserType } from "../../database/enums/usertype";
import { InjectableUser } from "../../database/entities/user.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  MERCHANT_HOTEL_ASSIGN_EVENT,
  MERCHANT_INACTIVE_EVENT,
} from "../../events";
import { MerchantColorService } from "./merchant-color.service";
import { AssignHotelsToMerchantWithMealPeriodsDTO } from "./dto/assign-hotel-merchant.dto";
import { PresignUrlDTO } from "src/item/dto/presign-url.dto";
import { S3Service } from "src/aws/s3.service";

@ApiTags("Merchant (Tenant)")
@Controller("tenant/merchant")
@ApiBearerAuth()
export class TenantMerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly cityService: CityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly merchantColorService: MerchantColorService,
    private readonly s3Service: S3Service
  ) {}

  @Patch(":merchant_id/assign/hotels-with-meal-periods")
  @UseGuards(AuthGuard)
  async assignHotelsToMerchantWithMealPeriods(
    @Param("merchant_id") merchantId: string,
    @Body() body: AssignHotelsToMerchantWithMealPeriodsDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const result =
      await this.merchantService.assignHotelsToMerchantWithMealPeriods(
        +merchantId,
        body.hotelMealPeriodMappings
      );
    if (result.success) {
      const assignedHotels = await this.merchantService.getAssignedHotels(
        +merchantId
      );

      assignedHotels.forEach((hotel) => {
        if (hotel.menuId) {
          this.eventEmitter.emit(MERCHANT_HOTEL_ASSIGN_EVENT, {
            menuId: hotel.menuId,
            id: hotel.hotelId,
          });
        }
      });
    }
    return RestApiResponse(result);
  }

  @Get(":merchant_id/hotels")
  @UseGuards(AuthGuard)
  async getAssignedHotels(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const hotels = await this.merchantService.getAssignedHotels(+merchantId);
    return RestApiResponse(hotels);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createMerchantDTO: CreateMerchantDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    // Generate a unique color before creating the merchant
    const color = await this.merchantColorService.generateUniqueColor();
    const merchantData = {
      ...createMerchantDTO,
      color,
    };

    const merchant = await this.merchantService.create(merchantData);
    return RestApiResponse(new MerchantVM(merchant).build());
  }

  @Post("s3/presign/merchant/image/:merchant_id")
  @UseGuards(AuthGuard)
  async presignMerchantUrlPost(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() presignUrlDTO: PresignUrlDTO
  ) {
    const expiresIn = 1800;
    const imageS3Name = getMerchantImageS3Name(+merchantId);
    const contentType = presignUrlDTO.contentType;
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType,
    });
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn,
      contentType,
    });
  }

  @Post("s3/presign/merchant/cover/image/:merchant_id")
  @UseGuards(AuthGuard)
  async presignMerchantCoverImageUrlPost(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() presignUrlDTO: PresignUrlDTO
  ) {
    const expiresIn = 1800;
    const imageS3Name = getMerchantCoverImageS3Name(+merchantId);
    const contentType = presignUrlDTO.contentType;
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType,
    });
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn,
      contentType,
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const merchants = await this.merchantService.find({
      order: {
        updatedAt: "DESC",
      },
      relations: ["mealPeriods"],
    });
    const citiesMap = await this.cityService.findAsMap();
    const merchantsVM = merchants.map((merchant) => ({
      ...merchant,
      cityName: citiesMap[merchant.cityId]?.name || "",
      timezone: citiesMap[merchant.cityId]?.timezone || "",
    }));
    return RestApiResponse(merchantsVM);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const merchant = await this.merchantService.findOne({
      where: {
        id: +id,
      },
    });
    const citiesMap = await this.cityService.findAsMap();
    return RestApiResponse({
      ...merchant,
      cityName: citiesMap[merchant.cityId]?.name || "",
      timezone: citiesMap[merchant.cityId]?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
    });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param("id") id: string,
    @Body() updateMerchantDTO: UpdateMerchantDTO
  ) {
    const merchant = await this.merchantService.update(
      {
        id: +id,
      },
      updateMerchantDTO
    );
    this.eventEmitter.emit(MERCHANT_INACTIVE_EVENT, merchant.id);
    return RestApiResponse(new MerchantVM(merchant).build());
  }

  @Patch(":id/active")
  @UseGuards(AuthGuard)
  async changeStatus(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param("id") id: string,
    @Body() updateMerchantStatusDTO: UpdateMerchantStatusDTO
  ) {
    const merchant = await this.merchantService.findOne({
      where: {
        id: +id,
      },
    });
    const updatedMerchant = await this.merchantService.update(
      {
        id: +id,
      },
      {
        isActive: updateMerchantStatusDTO.isActive,
      }
    );
    this.eventEmitter.emit(MERCHANT_INACTIVE_EVENT, updatedMerchant.id);
    return RestApiResponse(updatedMerchant);
  }
}
