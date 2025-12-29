import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Hotel } from "../../database/entities/hotel.entity";
import { Menu } from "../../database/entities/menu.entity";
import { MenuHotel } from "../../database/entities/menu_hotel.entity";
import { DataSource, In, Repository } from "typeorm";
import {
  HOTEL_REPOSITORY,
  MENU_HOTEL_REPOSITORY,
  MENU_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import { CreateMenuDTO } from "./dto/create-menu.dto";
import { ItemService } from "../item/item.service";
import { CityService } from "src/city/city.service";
import getMealPeriodWorkingHours from "src/utils/getMealPeriodWorkingHours";
import { isWithinMealPeriod } from "src/utils/isWithinMealPeriod";
import { FetchMenuDTO } from "./dto/fetch-menu.dto";

@Injectable()
export class MenuService {
  logger = new Logger();
  @Inject(MENU_REPOSITORY)
  private readonly menuRepository: Repository<Menu>;
  @Inject(MENU_HOTEL_REPOSITORY)
  private readonly menuHotelRepository: Repository<MenuHotel>;
  @Inject(HOTEL_REPOSITORY)
  private readonly hotelRepository: Repository<Hotel>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(ItemService)
  private readonly itemService: ItemService;
  @Inject(CityService)
  private readonly cityService: CityService;

  async create(createMenuDTO: CreateMenuDTO) {
    const menuEntity = await this.menuRepository.save({
      name: createMenuDTO.name,
    });
    if (createMenuDTO.hotelIds?.length > 1) {
      throw new HttpException(
        `Only one hotel per menu`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (createMenuDTO.hotelIds) {
      const hotels = await this.hotelRepository.find({
        where: {
          id: In(createMenuDTO.hotelIds),
        },
      });
      if (hotels.length !== createMenuDTO.hotelIds.length) {
        await this.menuRepository.delete({
          id: menuEntity.id,
        });
        throw new HttpException("Hotels inconsistency", HttpStatus.BAD_REQUEST);
      }
      await this.menuHotelRepository.save(
        createMenuDTO.hotelIds.map((hotelId) => {
          return {
            hotelId,
            menuId: menuEntity.id,
          };
        })
      );
    }
    return menuEntity;
  }

  async findByHotelId(hotelId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(`m.*`)
      .from("menus", "m")
      .innerJoin("menu_hotel", "mh", "mh.menu_id = m.id")
      .where("mh.hotel_id = :hotelId")
      .setParameter("hotelId", hotelId)
      .getRawMany();
  }

  async findOneById(id: number) {
    const entity = await this.menuRepository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      throw new HttpException(`Menu does not exist`, HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async getDetailedMenuItems(id: number, hotelId: number) {
    const qb = this.connection
      .createQueryBuilder()
      .select(
        `
        mi.id as menu_item_id, mi.menu_id, mi.menu_category_id,
        mc.name as menu_category_name, mc.order_position as menu_category_position,
        mp.id as meal_period_id, mp.name as meal_period_name, mp.merchant_id,
        mp.start_hour as meal_period_start_hour, mp.end_hour as meal_period_end_hour,
        i.id as item_id, i.name as item_name, i.image_url, i.description, i.order_quantity as item_order_quantity,
        mi.price, mi.new_price, mi.order_position, i.tags, oos.id as out_of_stock_id
      `
      )
      .from("menu_item", "mi")
      .innerJoin("menus", "m", "m.id = mi.menu_id")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mc.id = mi.menu_category_id")
      .innerJoin("meal_period", "mp", "mp.id = mc.meal_period_id")
      .innerJoin("menu_hotel", "mh", "mh.menu_id = m.id")
      .innerJoin(
        "merchant_hotel",
        "mhh",
        "mhh.hotel_id = mh.hotel_id and mhh.meal_period_id = mp.id"
      )
      .innerJoin("merchants", "merch", "merch.id = i.merchant_id")
      .leftJoin(
        "out_of_stock",
        "oos",
        "oos.item_id = i.id and oos.merchant_id = i.merchant_id"
      )
      .where("m.id = :menuId and mh.hotel_id = :hotelId")
      .andWhere("merch.is_active = :merchActive")
      .setParameter("menuId", id)
      .setParameter("hotelId", hotelId)
      .setParameter("merchActive", true);
    return await qb.getRawMany();
  }

  async getDetailedMenuItemsByMealPeriod(id: number, hotelId: number) {
    const qb = this.connection
      .createQueryBuilder()
      .select(
        `
        mi.id as menu_item_id, mi.menu_id, mi.menu_category_id,
        mc.name as menu_category_name, mc.order_position as menu_category_position,
        mp.id as meal_period_id, mp.name as meal_period_name, mp.merchant_id,
        mp.start_hour as meal_period_start_hour, mp.end_hour as meal_period_end_hour,
        i.id as item_id, i.name as item_name, i.image_url, i.description, i.order_quantity as item_order_quantity,
        mi.price, mi.new_price, mi.order_position, i.tags, oos.id as out_of_stock_id
      `
      )
      .from("menu_item", "mi")
      .innerJoin("menus", "m", "m.id = mi.menu_id")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mc.id = mi.menu_category_id")
      .innerJoin("meal_period", "mp", "mp.id = mc.meal_period_id")
      .innerJoin("menu_hotel", "mh", "mh.menu_id = m.id")
      .innerJoin(
        "merchant_hotel",
        "mhh",
        "mhh.hotel_id = mh.hotel_id and mhh.meal_period_id = mp.id"
      )
      .innerJoin("merchants", "merch", "merch.id = i.merchant_id")
      .leftJoin(
        "out_of_stock",
        "oos",
        "oos.item_id = i.id and oos.merchant_id = i.merchant_id"
      )
      .where("m.id = :menuId and mh.hotel_id = :hotelId")
      .andWhere("merch.is_active = :merchActive")
      .setParameter("menuId", id)
      .setParameter("hotelId", hotelId)
      .setParameter("merchActive", true)
      .groupBy("mp.id, mi.id, mc.id, i.id, oos.id");

    return await qb.getRawMany();
  }

  async fetchAssociatedMealPeriods(hotelId: number, merchantId: number) {
    return this.connection
      .createQueryBuilder()
      .select(`mp.*`)
      .from("meal_period", "mp")
      .innerJoin("merchant_hotel", "mhh", "mhh.meal_period_id = mp.id")
      .innerJoin("merchants", "merch", "merch.id = mhh.merchant_id")
      .where("mhh.hotel_id = :hotelId")
      .andWhere("merch.id = :merchantId")
      .andWhere("merch.is_active = :merchActive")
      .setParameter("hotelId", hotelId)
      .setParameter("merchantId", merchantId)
      .setParameter("merchActive", true)
      .getRawMany();
  }

  async fetchMenuItems(mealPeriodId: number, hotelId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(
        `
          mi.id as menu_item_id, mi.menu_id, mi.menu_category_id,
          mc.name as menu_category_name, mc.order_position as menu_category_position,
          mp.id as meal_period_id, mp.name as meal_period_name, mp.merchant_id,
          mp.start_hour as meal_period_start_hour, mp.end_hour as meal_period_end_hour,
          i.id as item_id, i.name as item_name, i.image_url, i.description, i.order_quantity as item_order_quantity,
          mi.price, mi.new_price, mi.order_position, i.tags, oos.id as out_of_stock_id
        `
      )
      .from("menu_item", "mi")
      .innerJoin("menus", "m", "m.id = mi.menu_id")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mc.id = mi.menu_category_id")
      .innerJoin("meal_period", "mp", "mp.id = mc.meal_period_id")
      .innerJoin("menu_hotel", "mh", "mh.menu_id = m.id")
      .innerJoin(
        "merchant_hotel",
        "mhh",
        "mhh.hotel_id = mh.hotel_id and mhh.meal_period_id = mp.id"
      )
      .innerJoin("merchants", "merch", "merch.id = i.merchant_id")
      .leftJoin(
        "out_of_stock",
        "oos",
        "oos.item_id = i.id and oos.merchant_id = i.merchant_id"
      )
      .where("mp.id = :mealPeriodId and mh.hotel_id = :hotelId")
      .andWhere("merch.is_active = :merchActive")
      .setParameter("mealPeriodId", mealPeriodId)
      .setParameter("hotelId", hotelId)
      .setParameter("merchActive", true)
      .groupBy("mp.id, mi.id, mc.id, i.id, oos.id")
      .getRawMany();
  }

  async fetchMenuDetailsByMerchantId(
    hotelId: number,
    merchantId: number,
    fetchMenuPayload: FetchMenuDTO
  ) {
    let currentMealPeriodId = null;
    let itemsModifiersMap = {};
    const hotelMerchantsMap = await this.getHotelMerchantsMap(hotelId);
    const hotel = await this.hotelRepository.findOne({
      where: {
        id: hotelId,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: hotel.cityId,
      },
    });
    const associatedMealPeriods = await this.fetchAssociatedMealPeriods(
      hotelId,
      merchantId
    );

    if (associatedMealPeriods.length > 0) {
      for (const associatedMealPeriod of associatedMealPeriods) {
        const {
          mealPeriodStartTime,
          mealPeriodEndTime,
          scheduledEndTime,
          scheduledStartTime,
          isLateNightMeal,
        } = getMealPeriodWorkingHours({
          timezone: city?.timezone,
          startHour: associatedMealPeriod?.start_hour,
          endHour: associatedMealPeriod?.end_hour,
          scheduledStartHour: fetchMenuPayload?.scheduledStartTime,
          scheduledEndHour: fetchMenuPayload?.scheduledEndTime,
        });

        const mealPeriodIsAvailable = isWithinMealPeriod(
          mealPeriodStartTime,
          mealPeriodEndTime,
          scheduledStartTime,
          scheduledEndTime,
          isLateNightMeal
        );
        if (mealPeriodIsAvailable) {
          currentMealPeriodId = associatedMealPeriod.id;
          break;
        }
      }
      if (currentMealPeriodId) {
        const menuItems = await this.fetchMenuItems(
          currentMealPeriodId,
          hotelId
        );
        if (menuItems.length == 0) {
          return [];
        }
        const itemModifiers = await this.itemService.getItemModifiers(
          menuItems.map((menuItem) => menuItem.item_id)
        );

        for (const itemModifier of itemModifiers) {
          if (itemsModifiersMap[itemModifier?.item_id]) {
            itemsModifiersMap[itemModifier?.item_id].push(itemModifier);
          } else {
            itemsModifiersMap[itemModifier?.item_id] = [];
            itemsModifiersMap[itemModifier?.item_id].push(itemModifier);
          }
        }
        for (let i = 0; i < menuItems.length; i++) {
          if (menuItems[i].out_of_stock_id) {
            delete menuItems[i];
            continue;
          }
          menuItems[i].modifiers =
            itemsModifiersMap[menuItems[i]?.item_id] ?? [];
          menuItems[i].merchant_name =
            hotelMerchantsMap[menuItems[i].merchant_id]?.name ?? "";
          menuItems[i].tax_rate =
            hotelMerchantsMap[menuItems[i].merchant_id]?.tax_rate ?? 0.0;
          menuItems[i].merchant_is_active =
            hotelMerchantsMap[menuItems[i].merchant_id]?.is_active ?? false;
        }
        menuItems.filter((mi) => mi != null);

        for (let i = 0; i < menuItems.length; i++) {
          if (menuItems[i]) {
            menuItems[i].price = menuItems[i]?.new_price
              ? menuItems[i]?.new_price
              : menuItems[i]?.price;
          }
        }

        const groupedMenuItems = menuItems.reduce((acc, item) => {
          const sortByCondition =
            item.menu_category_position ?? item.menu_category_id;
          if (!acc[sortByCondition]) {
            acc[sortByCondition] = [];
          }
          acc[sortByCondition].push(item);
          return acc;
        }, {});

        return groupedMenuItems;
      }
    }
  }

  private async getHotelMerchantsMap(hotelId: number) {
    const data = await this.connection
      .createQueryBuilder()
      .select("m.*")
      .from("merchant_hotel", "mh")
      .innerJoin("merchants", "m", "m.id = mh.merchant_id")
      .where("mh.hotel_id = :hotelId")
      .andWhere("m.is_active = :active")
      .setParameter("hotelId", hotelId)
      .setParameter("active", true)
      .getRawMany();
    if (data.length == 0) {
      throw new HttpException(
        "Hotel not associated with a merchant",
        HttpStatus.BAD_REQUEST
      );
    }
    const map = {};
    data.forEach((merchant) => {
      map[merchant.id] = merchant;
    });
    return map;
  }

  async getDetailedMenu(id: number, hotelId: number) {
    const hotelMerchantsMap = await this.getHotelMerchantsMap(hotelId);
    const itemsModifiersMap = {};
    const menuItems = await this.getDetailedMenuItems(id, hotelId);
    if (menuItems.length == 0) {
      return [];
    }
    const itemModifiers = await this.itemService.getItemModifiers(
      menuItems.map((menuItem) => menuItem.item_id)
    );

    for (const itemModifier of itemModifiers) {
      if (itemsModifiersMap[itemModifier?.item_id]) {
        itemsModifiersMap[itemModifier?.item_id].push(itemModifier);
      } else {
        itemsModifiersMap[itemModifier?.item_id] = [];
        itemsModifiersMap[itemModifier?.item_id].push(itemModifier);
      }
    }
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].out_of_stock_id) {
        delete menuItems[i];
        continue;
      }
      menuItems[i].modifiers = itemsModifiersMap[menuItems[i]?.item_id] ?? [];
      menuItems[i].merchant_name =
        hotelMerchantsMap[menuItems[i].merchant_id]?.name ?? "";
      menuItems[i].tax_rate =
        hotelMerchantsMap[menuItems[i].merchant_id]?.tax_rate ?? 0.0;
      menuItems[i].merchant_is_active =
        hotelMerchantsMap[menuItems[i].merchant_id]?.is_active ?? false;
    }
    return menuItems.filter((mi) => mi != null);
  }

  async synchronizeMenuContent(
    sourceMenuId: number,
    targetMenuId: number,
    merchantIds: number[]
  ): Promise<number> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sourceCategories, sourceItems] = await Promise.all([
        this.getMenuCategories(sourceMenuId, merchantIds),
        this.getMenuItems(sourceMenuId),
      ]);

      const categoryIdMap = await this.synchronizeCategoriesBatch(
        sourceCategories,
        targetMenuId,
        merchantIds,
        queryRunner
      );

      await this.synchronizeItemsBatch(
        sourceItems,
        categoryIdMap,
        targetMenuId,
        merchantIds,
        queryRunner
      );

      await queryRunner.commitTransaction();
      return targetMenuId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error synchronizing menu content:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getMenuCategories(
    menuId: number,
    merchantIds: number[]
  ): Promise<any[]> {
    return this.connection
      .createQueryBuilder()
      .from("menu_category", "mc")
      .innerJoin("meal_period", "mp", "mc.meal_period_id = mp.id")
      .where("mp.merchant_id IN (:...merchantIds)", {
        merchantIds,
      })
      .andWhere("mc.menu_id = :menuId", { menuId })
      .select(["mc.mealPeriodId", "mc.id", "mc.name", "mc.orderPosition"])
      .groupBy("mc.id")
      .orderBy("mc.id", "ASC")
      .getMany();
  }

  private async synchronizeCategoriesBatch(
    sourceCategories: any[],
    targetMenuId: number,
    merchantIds: number[],
    queryRunner: any
  ): Promise<Record<number, number>> {
    const sourceCategoryMap = new Map(
      sourceCategories.map((category) => [
        this.createCategoryKey(category),
        category,
      ])
    );

    const existingCategories = await this.getMenuCategories(
      targetMenuId,
      merchantIds
    );
    const existingCategoryMap = new Map(
      existingCategories.map((category) => [
        this.createCategoryKey(category),
        category,
      ])
    );

    const categoryOperations = this.prepareCategoryOperations(
      sourceCategoryMap,
      existingCategoryMap,
      targetMenuId
    );

    const categoryIdMap = await this.executeCategoryOperations(
      categoryOperations,
      sourceCategories,
      existingCategories,
      queryRunner
    );

    return categoryIdMap;
  }

  private createCategoryKey(category: any): string {
    return `${category.name.toLowerCase().trim()}-${category.mealPeriodId}`;
  }

  private prepareCategoryOperations(
    sourceCategoryMap: Map<string, any>,
    existingCategoryMap: Map<string, any>,
    targetMenuId: number
  ): {
    toInsert: any[];
    toRemove: any[];
    toUpdate: any[];
  } {
    const toInsert = [];
    const toRemove = [];
    const toUpdate = [];

    for (const [key, sourceCategory] of sourceCategoryMap) {
      if (!existingCategoryMap.has(key)) {
        toInsert.push({
          name: sourceCategory.name,
          description: sourceCategory.description,
          menuId: targetMenuId,
          mealPeriodId: sourceCategory.mealPeriodId,
          originalId: sourceCategory.id,
          orderPosition: sourceCategory.orderPosition,
        });
      } else {
        const existingCategory = existingCategoryMap.get(key);
        if (
          sourceCategory.name.toLowerCase().trim() ===
            existingCategory.name.toLowerCase().trim() &&
          sourceCategory.mealPeriodId === existingCategory.mealPeriodId &&
          sourceCategory.orderPosition === existingCategory.orderPosition
        ) {
          continue;
        } else {
          toUpdate.push({
            id: existingCategory.id,
            name: sourceCategory.name,
            description: sourceCategory.description,
            mealPeriodId: sourceCategory.mealPeriodId,
            orderPosition: sourceCategory.orderPosition,
          });
        }
      }
    }

    for (const [key, existingCategory] of existingCategoryMap) {
      if (!sourceCategoryMap.has(key)) {
        toRemove.push(existingCategory);
      }
    }

    return { toInsert, toRemove, toUpdate };
  }

  private async executeCategoryOperations(
    categoryOperations: { toInsert: any[]; toRemove: any[]; toUpdate: any[] },
    sourceCategories: any[],
    existingCategories: any[],
    queryRunner: any
  ): Promise<Record<number, number>> {
    const categoryIdMap: Record<number, number> = {};

    if (categoryOperations.toInsert.length > 0) {
      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("menu_category")
        .values(
          categoryOperations.toInsert.map(
            ({ name, description, menuId, mealPeriodId, orderPosition }) => ({
              name,
              description,
              menuId,
              mealPeriodId,
              orderPosition,
            })
          )
        )
        .execute();

      categoryOperations.toInsert.forEach((category, index) => {
        categoryIdMap[category.originalId] = insertResult.identifiers[index].id;
      });
    }

    if (categoryOperations.toUpdate.length > 0) {
      const queryBuilder = queryRunner.manager.createQueryBuilder();

      const caseStatements = categoryOperations.toUpdate
        .map(
          (category, index) =>
            `WHEN id = :id${index} THEN CAST(:orderPosition${index} AS SMALLINT)`
        )
        .join(" ");

      const ids = categoryOperations.toUpdate
        .map((category, index) => `:id${index}`)
        .join(", ");

      const parameters = categoryOperations.toUpdate.reduce(
        (acc, category, index) => {
          acc[`id${index}`] = category.id;
          acc[`orderPosition${index}`] = category.orderPosition;
          return acc;
        },
        {}
      );

      await queryBuilder
        .update("menu_category")
        .set({
          orderPosition: () => `CASE ${caseStatements} END`,
        })
        .where(`id IN (${ids})`)
        .setParameters(parameters)
        .execute();
    }

    if (categoryOperations.toRemove.length > 0) {
      const categoryIdsToRemove = categoryOperations.toRemove.map(
        (category) => category.id
      );

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from("menu_item")
        .where("menu_category_id IN (:...categoryIds)", {
          categoryIds: categoryIdsToRemove,
        })
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from("menu_category")
        .where("id IN (:...categoryIds)", { categoryIds: categoryIdsToRemove })
        .execute();
    }

    existingCategories.forEach((existingCategory) => {
      const sourceCategory = sourceCategories.find(
        (src) =>
          src.name.toLowerCase().trim() ===
            existingCategory.name.toLowerCase().trim() &&
          src.mealPeriodId === existingCategory.mealPeriodId
      );

      if (sourceCategory) {
        categoryIdMap[sourceCategory.id] = existingCategory.id;
      }
    });

    return categoryIdMap;
  }

  private async getMenuItems(menuId: number): Promise<any[]> {
    return this.connection
      .createQueryBuilder()
      .select([
        "mi.id",
        "mi.menuCategoryId",
        "mi.itemId",
        "mi.merchantId",
        "mi.price",
        "mi.newPrice",
        "mi.orderPosition",
      ])
      .from("menu_item", "mi")
      .where("mi.menu_id = :menuId", { menuId })
      .getMany();
  }

  private async synchronizeItemsBatch(
    sourceItems: any[],
    categoryIdMap: Record<number, number>,
    targetMenuId: number,
    merchantIds: number[],
    queryRunner: any
  ): Promise<void> {
    const validSourceItems = sourceItems.filter((a) =>
      merchantIds.includes(a.merchantId)
    );

    // Batch fetch existing items to reduce database queries
    const existingItems = await queryRunner.manager
      .createQueryBuilder()
      .select([
        "mi.id",
        "mi.menuCategoryId",
        "mi.itemId",
        "mi.merchantId",
        "mi.orderPosition",
      ])
      .from("menu_item", "mi")
      .where("mi.menu_id = :targetMenuId", { targetMenuId })
      .getMany();

    const itemsToInsert = validSourceItems.filter(
      (item) =>
        !existingItems.some(
          (existing) =>
            existing.menuCategoryId === categoryIdMap[item.menuCategoryId] &&
            existing.itemId === item.itemId &&
            existing.merchantId === item.merchantId
        )
    );

    const itemsToUpdate = validSourceItems.filter((item) =>
      existingItems.some(
        (existing) =>
          existing.menuCategoryId === categoryIdMap[item.menuCategoryId] &&
          existing.itemId === item.itemId &&
          existing.merchantId === item.merchantId
      )
    );

    const itemsToRemove = existingItems
      .filter(
        (existingItem) =>
          !validSourceItems.some(
            (sourceItem) =>
              existingItem.menuCategoryId ===
                categoryIdMap[sourceItem.menuCategoryId] &&
              existingItem.itemId === sourceItem.itemId &&
              existingItem.merchantId === sourceItem.merchantId
          )
      )
      .filter((a) => merchantIds.includes(a.merchantId));

    // Batch insert new items
    if (itemsToInsert.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("menu_item")
        .values(
          itemsToInsert.map((item) => ({
            menuId: targetMenuId,
            menuCategoryId: categoryIdMap[item.menuCategoryId],
            itemId: item.itemId,
            price: item.price,
            newPrice: item.newPrice ?? null,
            merchantId: item.merchantId,
            orderPosition: item.orderPosition,
          }))
        )
        .execute();
    }

    if (itemsToUpdate.length > 0) {
      const queryBuilder = queryRunner.manager.createQueryBuilder();

      const caseStatements = {
        price: itemsToUpdate
          .map(
            (item, index) =>
              `WHEN id = :id${index} THEN CAST(:price${index} AS NUMERIC(10,5))`
          )
          .join(" "),
        newPrice: itemsToUpdate
          .map(
            (item, index) =>
              `WHEN id = :id${index} THEN CAST(:newPrice${index} AS NUMERIC(10,5))`
          )
          .join(" "),
        merchantId: itemsToUpdate
          .map(
            (item, index) =>
              `WHEN id = :id${index} THEN CAST(:merchantId${index} AS INT4)`
          )
          .join(" "),
        orderPosition: itemsToUpdate
          .map(
            (item, index) =>
              `WHEN id = :id${index} THEN CAST(:orderPosition${index} AS SMALLINT)`
          )
          .join(" "),
      };

      const ids = itemsToUpdate.map((_, index) => `:id${index}`).join(", ");

      const parameters = itemsToUpdate.reduce((acc, item, index) => {
        const existingItem = existingItems.find(
          (existing) =>
            existing.menuCategoryId === categoryIdMap[item.menuCategoryId] &&
            existing.itemId === item.itemId &&
            existing.merchantId === item.merchantId
        );

        if (!existingItem) return acc;

        acc[`id${index}`] = existingItem.id;
        acc[`price${index}`] = item.price;
        acc[`newPrice${index}`] = item.newPrice ?? null;
        acc[`merchantId${index}`] = item.merchantId;
        acc[`orderPosition${index}`] = item.orderPosition;

        return acc;
      }, {});

      await queryBuilder
        .update("menu_item")
        .set({
          price: () => `CASE ${caseStatements.price} END`,
          newPrice: () => `CASE ${caseStatements.newPrice} END`,
          merchantId: () => `CASE ${caseStatements.merchantId} END`,
          orderPosition: () => `CASE ${caseStatements.orderPosition} END`,
        })
        .where(`id IN (${ids})`)
        .setParameters(parameters)
        .execute();
    }

    if (itemsToRemove.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from("menu_item")
        .where("id IN (:...itemIds)", {
          itemIds: itemsToRemove.map((item) => item.id),
        })
        .execute();
    }
  }
}
