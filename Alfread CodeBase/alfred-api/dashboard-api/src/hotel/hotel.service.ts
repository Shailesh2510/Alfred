import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  HOTEL_REPOSITORY,
  MEAL_PERIOD_REPOSITORY,
  MENU_HOTEL_REPOSITORY,
  MERCHANT_HOTEL_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import { Hotel } from "../../database/entities/hotel.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateHotelDTO } from "./dto/create-hotel.dto";
import { UpdateHotelDTO } from "./dto/update-hotel.dto";
import { MerchantVM } from "../merchant/vm/merchant.vm";
import { CityService } from "../city/city.service";
import { BaseService } from "src/base.service";
import { MerchantHotel } from "../../database/entities/merchant.entity";
import { MealPeriod } from "../../database/entities/meal_period.entity";
import { S3HotelVM } from "./vm/hotel.vm";
import { S3Service } from "src/aws/s3.service";
import {
  DEFAULT_SYSTEM_TIMEZONE,
  GX_PHONE_NUMBER,
  getDeliveryFee,
  getHotelsS3Bucket,
  getHotelsS3BucketKey,
} from "helpers";
import { MenuService } from "src/menu/menu.service";
import { MenuHotel } from "database/entities/menu_hotel.entity";

@Injectable()
export class HotelService extends BaseService<
  Hotel,
  CreateHotelDTO,
  UpdateHotelDTO
> {
  @Inject(HOTEL_REPOSITORY)
  protected _repository: Repository<Hotel>;
  @Inject(PG_DATA_SOURCE)
  private connection: DataSource;
  @Inject(CityService)
  private cityService: CityService;
  @Inject(MERCHANT_HOTEL_REPOSITORY)
  protected merchantHotelRepository: Repository<MerchantHotel>;
  @Inject(MEAL_PERIOD_REPOSITORY)
  protected mealPeriodRepository: Repository<MealPeriod>;
  @Inject(S3Service)
  private s3Service: S3Service;
  @Inject(MenuService)
  private menuService: MenuService;
  @Inject(MENU_HOTEL_REPOSITORY)
  private readonly menuHotelRepository: Repository<MenuHotel>;

  async getHotelMealPeriods(hotelId: number) {
    const merchantHotels = await this.merchantHotelRepository.find({
      where: {
        hotelId,
      },
    });
    const merchantIds = merchantHotels.map((mh) => mh.merchantId);
    const mealPeriods = await this.mealPeriodRepository.find({
      where: {
        merchantId: In(merchantIds),
      },
    });
    return mealPeriods.map((mp) => {
      return {
        id: mp.id,
        name: mp.name,
        startHour: mp.startHour,
        endHour: mp.endHour,
      };
    });
  }

  async create(createHotelDTO: CreateHotelDTO) {
    await this.cityService.findOne({
      where: {
        id: createHotelDTO.cityId,
      },
    });
    let existingHotel = null;
    try {
      existingHotel = await this.findOne({
        where: {
          webCode: createHotelDTO.webCode,
        },
      });
    } catch (err) {
      console.log(`hotel does not exist - creating one`);
    }

    if (existingHotel) {
      throw new HttpException(
        `Hotel web code must be unique`,
        HttpStatus.CONFLICT
      );
    }

    const hotel = await this._repository.save(createHotelDTO);
    if (hotel) {
      const menu = await this.menuService.create({
        name: `${hotel.name}-Main-Menu`,
        hotelIds: [hotel.id],
      });
      await this._repository.update(
        {
          id: hotel.id,
        },
        {
          menuId: menu?.id,
        }
      );
    }
    return await this.findOne({
      where: {
        id: hotel.id,
      },
    });
  }

  async findHotelByHotelName(hotelName: string) {
    const searchQuery = hotelName.toLowerCase();

    return await this.connection
      .createQueryBuilder()
      .select("h.*")
      .from("hotels", "h")
      .where("LOWER(h.name) ILIKE :search", {
        search: `%${searchQuery}%`,
      })
      .orderBy(
        `CASE 
          WHEN LOWER(h.name) LIKE :exactMatch THEN 0
          WHEN LOWER(h.name) LIKE :startsWith THEN 1
          WHEN LOWER(h.name) LIKE :contains THEN 2
          ELSE 3
        END`,
        "ASC"
      )
      .addOrderBy("SIMILARITY(LOWER(h.name), :similarity)", "DESC")
      .setParameters({
        exactMatch: searchQuery,
        startsWith: `${searchQuery}%`,
        contains: `%${searchQuery}%`,
        similarity: searchQuery,
      })
      .limit(1)
      .getRawOne();
  }

  async setPublishedMenu(id: number, menuId: number) {
    return await this._repository.update(
      {
        id,
      },
      {
        menuId,
      }
    );
  }

  async findAllWithRelations() {
    return await this.connection
      .createQueryBuilder()
      .select(
        `
        h._id as id, h.name, h.address_number, h.address_street, h.address_town, h.address_zip_code,
        h.code, h.web_code, h.allow_credit_card, h.allow_room_charge, h.is_tax_exempt, h.is_active,
        h.has_cutlery, h.has_delivery_fee, h.enable_automatic_tip,h.coordinates, 
        c._id as city_id, c.name as city_name, c.timezone, m._id as menu_id
        `
      )
      .from("hotels", "h")
      .innerJoin("menus", "m", "m.id = h.menu_id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .innerJoin("merchant_hotel", "mh", "mh.hotel_id = h.id")
      .andWhere(`h.is_active = :isActive`)
      .setParameter("isActive", true)
      .getRawMany();
  }

  async findMenu(hotelId: number) {
    return await this.connection
      .createQueryBuilder()
      .select("m.*")
      .from("menu_hotel", "mh")
      .innerJoin("menus", "m", "m.id = mh.menu_id")
      .where("mh.hotel_id = :hotelId")
      .setParameter("hotelId", hotelId)
      .getRawOne();
  }

  async findHotelMerchants(hotelId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(["m.*", "mh.orderPosition as order_position"])
      .from("merchants", "m")
      .innerJoin("merchant_hotel", "mh", "mh.merchant_id = m.id")
      .innerJoin("hotels", "h", "mh.hotel_id = h.id")
      .where("mh.hotel_id = :hotelId")
      .setParameter("hotelId", hotelId)
      .getRawMany();
  }

  async getAllActiveMerchants(hotelId: number) {
    return await this.connection
      .createQueryBuilder()
      .select([
        "m.*, c.name as city_name",
        "mh.orderPosition as order_position",
        "ARRAY_AGG(mp.id) as meal_period_ids",
      ])
      .from("hotels", "h")
      .innerJoin("merchant_hotel", "mh", "mh.hotel_id = h.id")
      .innerJoin("merchants", "m", "m.id = mh.merchant_id")
      .innerJoin("meal_period", "mp", "mp.merchant_id = mh.merchant_id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .where("mh.hotel_id = :hotelId", { hotelId })
      .andWhere("m.is_active = :isActive", { isActive: true })
      .groupBy("m.id, c.name, mh.order_position")
      .getRawMany();
  }
  async getCarmelMealPeriodId(merchantId: number) {
    const mealPeriods = await this.connection
      .createQueryBuilder()
      .select("mp.id")
      .from("meal_period", "mp")
      .innerJoin("merchants", "m", "m.id = mp.merchant_id")
      .where("m.merchant_type = RIDES")
      .where("mp.merchant_id = :merchantId", { merchantId })
      .groupBy("mp.merchant_id, mp.id")
      .getRawMany();

    return mealPeriods.map((mealPeriod) => mealPeriod.mp_id);
  }

  async getMerchantPerMealPeriod(menuId: number) {
    const qb = this.connection
      .createQueryBuilder()
      .select(
        `
        i.merchant_id, json_agg(distinct jsonb_build_object('id', mp.id, 'name', mp.name, 'startHour', mp.start_hour, 'endHour', mp.end_hour)) as meal_periods
      `
      )
      .from("menu_item", "mi")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mc.id = mi.menu_category_id")
      .innerJoin("meal_period", "mp", "mp.id = mc.meal_period_id")
      .where("mi.menu_id = :menuId")
      .setParameter("menuId", menuId)
      .groupBy("i.merchant_id");
    return await qb.getRawMany();
  }

  async getMerchantPerMealPeriodByHotel(hotelId: number) {
    const qb = this.connection
      .createQueryBuilder()
      .select(
        `
        m.id as merchant_id, coalesce(json_agg(distinct jsonb_build_object('id', mp.id, 'name', mp.name, 'startHour', mp.start_hour, 'endHour', mp.end_hour)) filter (where mp.id is not null), '[]') as meal_periods
      `
      )
      .from("merchants", "m")
      .innerJoin("merchant_hotel", "mh", "mh.merchant_id = m.id")
      .leftJoin("meal_period", "mp", "mp.id = mh.meal_period_id")
      .where("mh.hotel_id = :hotelId")
      .setParameter("hotelId", hotelId)
      .groupBy("m.id");
    return await qb.getRawMany();
  }

  async findHotelMerchant(hotelId: number, merchantId: number) {
    const merchant = await this.connection
      .createQueryBuilder()
      .select("m.*")
      .from("merchants", "m")
      .innerJoin("merchant_hotel", "mh", "mh.merchant_id = m.id")
      .where("mh.hotel_id = :hotelId")
      .andWhere("mh.merchant_id = :merchantId")
      .setParameter("hotelId", hotelId)
      .setParameter("merchantId", merchantId)
      .getRawOne();
    if (!merchant) {
      throw new HttpException(
        "Hotel merchant does not exists",
        HttpStatus.NOT_FOUND
      );
    }
    return new MerchantVM(merchant).build();
  }

  async getMealPeriods(merchantId: number, mealPeriodIds: number[]) {
    const mealPeriods = await this.mealPeriodRepository.find({
      where: {
        id: In(mealPeriodIds),
        merchantId: merchantId,
      },
    });
    if (!mealPeriods) {
      throw new HttpException(
        `Meal periods do not not exist`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (mealPeriods.length != mealPeriodIds.length) {
      throw new HttpException(
        `Meal periods do not not match`,
        HttpStatus.BAD_REQUEST
      );
    }
    return mealPeriods;
  }

  async assignMerchantToHotel(
    hotelId: number,
    merchantId: number,
    mealPeriodIds: number[]
  ) {
    let merchant = null;
    try {
      merchant = await this.findHotelMerchant(hotelId, merchantId);
    } catch (err) {
      //since the merchant does not exist, then create the hotel merchant
      this.logger.log("Hotel Merchant relation does not exist - creating ..");
    }
    const mealPeriods = await this.getMealPeriods(merchantId, mealPeriodIds);
    // if (!merchant) {
    const promises = [];
    mealPeriods.forEach((mealPeriod) =>
      promises.push(
        this.merchantHotelRepository.save({
          hotelId,
          merchantId,
          mealPeriodId: mealPeriod.id,
        })
      )
    );
    return await Promise.all(promises);
    // }

    // throw new HttpException('Merchant and Hotel relation exists', HttpStatus.CONFLICT);
  }

  async unassignMerchantFromHotel(
    hotelId: number,
    merchantId: number,
    mealPeriodIds: number[]
  ) {
    let merchantHotels = null;
    const hotel = await this.findOne({
      where: {
        id: hotelId,
      },
    });
    try {
      merchantHotels = await this.merchantHotelRepository.delete({
        hotelId,
        merchantId,
        mealPeriodId: In(mealPeriodIds),
      });
    } catch (err) {
      //since the merchant does not exist, then create the hotel merchant
      this.logger.log("Failed to unassign merchant from hotel: ", err);
      throw new HttpException(
        "Failed to unassign merchant from hotel",
        HttpStatus.CONFLICT
      );
    }
    return hotel;
  }

  async regenerateHotelList() {
    const hotels = await this.findAllWithRelations();
    const hotelsVM = new S3HotelVM(
      hotels.map((hotel) => ({
        ...hotel,
        deliveryFee: getDeliveryFee(hotel.has_delivery_fee, 0),
        hasDeliveryFee: hotel.has_delivery_fee,
        gxPhoneNumber: GX_PHONE_NUMBER,
        timezone: hotel.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
      }))
    ).build();

    try {
      await this.s3Service.putObject({
        Bucket: getHotelsS3Bucket(),
        Key: getHotelsS3BucketKey(),
        Body: JSON.stringify(hotelsVM),
        ContentType: "application/json",
      });
    } catch (err) {
      this.logger.error(
        `HotelListEventHandler@regenerateHotelList: ${err.message}`
      );
    }
  }

  async editAssignMerchantToHotel(
    hotelId: number,
    merchantId: number,
    mealPeriodIds: number[]
  ) {
    // const mealPeriods = await this.getMealPeriods(merchantId, mealPeriodIds)
    const deletePromises = [];
    // mealPeriods.forEach(mealPeriod => deletePromises.push(
    //   this.merchantHotelRepository.delete({
    //     hotelId,
    //     merchantId,
    //     mealPeriodId: mealPeriod.id
    //   })
    // ))
    const merchantHotels = await this.merchantHotelRepository.find({
      where: {
        merchantId,
        hotelId,
      },
    });
    merchantHotels.forEach((merchantHotel) => {
      deletePromises.push(
        this.merchantHotelRepository.delete({
          id: merchantHotel.id,
        })
      );
    });

    await Promise.all(deletePromises);

    return await this.assignMerchantToHotel(hotelId, merchantId, mealPeriodIds);
  }

  async editOrderMerchantsPositionToHotel(
    hotelId: number,
    merchants: { merchantId: number; orderPosition: number }[]
  ) {
    try {
      const updatePromises = merchants.map(({ merchantId, orderPosition }) => {
        return this.merchantHotelRepository
          .createQueryBuilder()
          .update(MerchantHotel)
          .set({ orderPosition })
          .where("hotelId = :hotelId", { hotelId })
          .andWhere("merchantId = :merchantId", { merchantId })
          .execute();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating merchant positions:", error);
      throw new Error("Failed to update merchant positions to hotel.");
    }
  }

  /**
   * Finds similar hotels based on shared active merchants.
   * @param hotelId - The ID of the source hotel
   * @returns A list of similar hotels
   */
  async findSimilarHotels(hotelId: number): Promise<any[]> {
    try {
      const sourceMerchantIds = await this.getActiveMerchantsByHotel(hotelId);

      if (!sourceMerchantIds.length) {
        throw new HttpException(
          `No merchants found for the given hotel with ID ${hotelId}`,
          HttpStatus.NOT_FOUND
        );
      }

      return this.getSimilarHotels(hotelId, sourceMerchantIds);
    } catch (error) {
      console.error(
        `Error in findSimilarHotels for hotelId ${hotelId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves a list of active merchant IDs associated with a hotel.
   * @param hotelId - The ID of the hotel
   * @returns A list of merchant IDs
   */
  private async getActiveMerchantsByHotel(hotelId: number): Promise<number[]> {
    const merchants = await this.connection
      .createQueryBuilder()
      .select("DISTINCT mh.merchant_id", "merchant_id")
      .from("merchant_hotel", "mh")
      .innerJoin(
        "merchants",
        "m",
        "m.id = mh.merchant_id AND m.deleted_at IS NULL AND m.is_active = true"
      )
      .where("mh.hotel_id = :hotelId", { hotelId })
      .getRawMany();

    return merchants.map((merchant) => merchant.merchant_id);
  }

  /**
   * Retrieves similar hotels based on active merchants.
   * @param hotelId - The ID of the source hotel
   * @param merchantIds - List of active merchant IDs
   * @returns A list of similar hotels
   */
  private async getSimilarHotels(
    hotelId: number,
    merchantIds: number[]
  ): Promise<any[]> {
    return this.connection
      .createQueryBuilder()
      .select("h.*")
      .from("hotels", "h")
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select("mh.hotel_id", "hotel_id")
            .addSelect("COUNT(DISTINCT mh.merchant_id)", "merchant_count")
            .from("merchant_hotel", "mh")
            .innerJoin(
              "merchants",
              "m",
              "m.id = mh.merchant_id AND m.deleted_at IS NULL AND m.is_active = true"
            )
            .where("mh.merchant_id IN (:...merchantIds)", { merchantIds })
            .groupBy("mh.hotel_id")
            .having("COUNT(DISTINCT mh.merchant_id) > 0");
        },
        "matching_hotels",
        "matching_hotels.hotel_id = h.id"
      )
      .where("h.id != :hotelId", { hotelId })
      .andWhere("h.is_active = true")
      .getRawMany();
  }
}
