import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  MEAL_PERIOD_REPOSITORY,
  MERCHANT_HOTEL_REPOSITORY,
  MERCHANT_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import { DataSource, In, Repository } from "typeorm";
import { CreateMerchantDTO } from "./dto/create-merchant.dto";
import { UpdateMerchantDTO } from "./dto/update-merchant.dto";
import {
  Merchant,
  MerchantHotel,
} from "../../database/entities/merchant.entity";
import { BaseService } from "src/base.service";
import { CityService } from "src/city/city.service";
import { DEFAULT_SYSTEM_TIMEZONE } from "helpers";
import { AssignedHotel } from "./interfaces/assigned-hotel.interface";
import { MealPeriod } from "database/entities/meal_period.entity";

@Injectable()
export class MerchantService extends BaseService<
  Merchant,
  CreateMerchantDTO,
  UpdateMerchantDTO
> {
  @Inject(MERCHANT_REPOSITORY)
  protected _repository: Repository<Merchant>;
  @Inject(PG_DATA_SOURCE)
  private connection: DataSource;
  @Inject(CityService)
  private cityService: CityService;
  @Inject(MERCHANT_HOTEL_REPOSITORY)
  protected merchantHotelRepository: Repository<MerchantHotel>;
  @Inject(MEAL_PERIOD_REPOSITORY)
  protected mealPeriodRepository: Repository<MealPeriod>;
  async findMerchantHotelsWithMealPeriods(merchantId: number) {
    const merchant = await this.findOne({
      where: {
        id: +merchantId,
      },
    });
    const citiesMap = await this.cityService.findAsMap();

    const relatedHotels = await this.findMerchantHotels(merchantId);
    const hotelsPerMealPeriod = await this.getHotelPerMealPeriod(merchant.id);

    for (let i = 0; i < relatedHotels.length; i++) {
      relatedHotels[i].mealPeriods = [];
      for (let j = 0; j < hotelsPerMealPeriod.length; j++) {
        if (relatedHotels[i].id == hotelsPerMealPeriod[j].hotel_id) {
          relatedHotels[i].mealPeriods = hotelsPerMealPeriod[
            j
          ].meal_periods.map((mealPeriod) => {
            return {
              ...mealPeriod,
              timezone:
                citiesMap[merchant.cityId]?.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
            };
          });
        }
      }
    }

    return {
      relatedHotels,
    };
  }

  async findMerchantHotels(merchantId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(
        `
        h.*, c.name as city_name
      `
      )
      .from("hotels", "h")
      .innerJoin("merchant_hotel", "mh", "mh.hotel_id = h.id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .andWhere("mh.merchant_id = :merchantId")
      .setParameter("merchantId", merchantId)
      .getRawMany();
  }

  async fetchMerchantType(merchantId: number) {
    const result = await this.connection
      .createQueryBuilder()
      .select([`m.merchant_type`])
      .from("merchants", "m")
      .where("m.id = :merchantId")
      .setParameter("merchantId", merchantId)
      .getRawOne();
    return result;
  }

  async getHotelPerMealPeriod(merchantId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(
        `
        mh.hotel_id as hotel_id, json_agg(distinct jsonb_build_object('id', mp.id, 'name', mp.name, 'startHour', mp.start_hour, 'endHour', mp.end_hour)) as meal_periods
      `
      )
      .from("menu_item", "mi")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mc.id = mi.menu_category_id")
      .innerJoin("meal_period", "mp", "mp.id = mc.meal_period_id")
      .innerJoin("merchants", "m", "m.id = i.merchant_id")
      .innerJoin("merchant_hotel", "mh", "mh.merchant_id = m.id")
      .where("mh.merchant_id = :merchantId")
      .setParameter("merchantId", merchantId)
      .groupBy("mh.hotel_id")
      .getRawMany();
  }

  async getAssignedHotels(merchantId: number): Promise<AssignedHotel[]> {
    try {
      const hotels = await this.connection
        .createQueryBuilder()
        .select(
          `
          h.id as "hotelId",
          h.web_code as "hotelWebCode",
          h.name as "hotelName",
          m.id as "merchantId",
          h.is_active as "isActive",
          json_agg(
            json_build_object(
              'mealPeriodId', mp.id,
              'mealPeriodName', mp.name
            )
          ) as "associatedMealPeriods",
          menu_hotel_alias.menu_id as "menuId"
        `
        )
        .from("merchants", "m")
        .innerJoin("merchant_hotel", "mh", "mh.merchant_id = m.id")
        .innerJoin("hotels", "h", "h.id = mh.hotel_id")
        .innerJoin("meal_period", "mp", "mp.id = mh.meal_period_id")
        .leftJoin(
          "menu_hotel",
          "menu_hotel_alias",
          "menu_hotel_alias.hotel_id = h.id"
        )
        .where("m.id = :merchantId", { merchantId })
        .groupBy(
          "h.id, h.web_code, h.name, m.id, h.is_active, menu_hotel_alias.menu_id"
        )
        .getRawMany();

      return this.formatAssignedHotels(hotels);
    } catch (error) {
      console.error("Error occurred while fetching assigned hotels:", error);
      throw new Error("An error occurred while fetching assigned hotels.");
    }
  }

  private formatAssignedHotels(hotels: any[]): AssignedHotel[] {
    return hotels.map((hotel) => ({
      ...hotel,
      associatedMealPeriods: hotel.associatedMealPeriods.map((mp) => ({
        mealPeriodId: mp.mealPeriodId,
        mealPeriodName: mp.mealPeriodName,
      })),
    }));
  }

  async assignHotelsToMerchantWithMealPeriods(
    merchantId: number,
    hotelMealPeriodMappings: { hotelId: number; mealPeriodIds: number[] }[]
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.clearExistingMappings(merchantId, queryRunner);
      const newMappings = this.createHotelMealPeriodMappings(
        merchantId,
        hotelMealPeriodMappings
      );

      if (newMappings.length) {
        await queryRunner.manager.insert(MerchantHotel, newMappings);
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: "Hotels and meal periods assigned successfully",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        "Failed to assign hotels to merchant with meal periods:",
        error
      );
      throw new HttpException(
        "Failed to assign hotels to merchant with meal periods",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async clearExistingMappings(
    merchantId: number,
    queryRunner: any
  ): Promise<void> {
    await queryRunner.manager.delete(MerchantHotel, { merchantId });
  }

  private createHotelMealPeriodMappings(
    merchantId: number,
    hotelMealPeriodMappings: { hotelId: number; mealPeriodIds: number[] }[]
  ): { merchantId: number; hotelId: number; mealPeriodId: number }[] {
    const newMappings = [];

    for (const mapping of hotelMealPeriodMappings) {
      const { hotelId, mealPeriodIds } = mapping;

      if (!mealPeriodIds.length) continue;

      for (const mealPeriodId of mealPeriodIds) {
        newMappings.push({
          merchantId,
          hotelId,
          mealPeriodId,
        });
      }
    }

    return newMappings;
  }
}
