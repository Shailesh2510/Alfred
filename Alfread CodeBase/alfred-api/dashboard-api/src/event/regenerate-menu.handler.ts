import { OnEvent } from "@nestjs/event-emitter";
import {
  ITEM_UPDATED_EVENT,
  ITEM_DELETED_EVENT,
  MODIFIER_UPDATED_EVENT,
  MODIFIER_DELETED_EVENT,
  MENU_CATEGORY_UPDATED_EVENT,
  MENU_ITEM_UPDATED_EVENT,
  MENU_ITEM_DELETED_EVENT,
  ITEM_OUT_OF_STOCK_EVENT,
  MENU_HOTEL_UPDATED_EVENT,
  MERCHANT_HOTEL_UNASSIGN_EVENT,
  MENU_CATEGORY_DELETED_EVENT,
  MERCHANT_INACTIVE_EVENT,
  MERCHANT_HOTEL_ASSIGN_EVENT,
  MEAL_PERIOD_DELETED_EVENT
} from "../../events";
import { DataSource } from "typeorm";
import { Inject, Logger } from "@nestjs/common";
import { PG_DATA_SOURCE } from "../../constants";
import { PublishMenuService } from "../publish-menu/publish-menu.service";
import { MenuHotel } from "../../database/entities/menu_hotel.entity";
import { Hotel } from "../../database/entities/hotel.entity";

export class RegenerateMenuEventHandler {
  logger = new Logger();
  @Inject(PG_DATA_SOURCE)
  private connection: DataSource;
  @Inject(PublishMenuService)
  private publishMenuService: PublishMenuService;

  private async getMenuHotelsByItem(itemId: number) {
    return await this.connection.createQueryBuilder()
      .select('mi.menu_id, mh.hotel_id')
      .distinct(true)
      .from('menu_item', 'mi')
      .innerJoin('menu_hotel', 'mh', 'mh.menu_id = mi.menu_id')
      .where('mi.item_id = :itemId')
      .setParameter('itemId', itemId)
      .getRawMany();
  }

  private async getMenuHotelsByModifier(modifierId: number) {
    return await this.connection.createQueryBuilder()
      .select('mi.menu_id, mh.hotel_id')
      .distinct(true)
      .from('menu_item', 'mi')
      .innerJoin('menu_hotel', 'mh', 'mh.menu_id = mi.menu_id')
      .innerJoin('item_modifier', 'im', 'im.item_id = mi.item_id')
      .where('im.modifier_id = :modifierId')
      .setParameter('modifierId', modifierId)
      .getRawMany();
  }

  private async getMenuHotelsByMenuCategory(menuCategoryId: number) {
    return await this.connection.createQueryBuilder()
      .select('mc.menu_id, mh.hotel_id')
      .distinct(true)
      .from('menu_category', 'mc')
      .innerJoin('menu_hotel', 'mh', 'mh.menu_id = mc.menu_id')
      .where('mc.id = :menuCategoryId')
      .setParameter('menuCategoryId', menuCategoryId)
      .getRawMany();
  }

  private async getMenuHotelsByMenuItem(menuItemId: number) {
    return await this.connection.createQueryBuilder()
      .select('mi.menu_id, mh.hotel_id')
      .distinct(true)
      .from('menu_item', 'mi')
      .innerJoin('menu_hotel', 'mh', 'mh.menu_id = mi.menu_id')
      .where('mi.id = :menuItemId')
      .setParameter('menuItemId', menuItemId)
      .getRawMany();
  }

  private async getMerchantHotelMenus(merchantId: number) {
    return await this.connection.createQueryBuilder()
      .select('h.id as hotel_id, h.menu_id')
      .distinct(true)
      .from('merchant_hotel', 'mh')
      .innerJoin('merchants', 'm', 'm.id = mh.merchant_id')
      .innerJoin('hotels', 'h', 'h.id = mh.hotel_id')
      .where('m.id = :id')
      .setParameter('id', merchantId)
      .getRawMany()
  }

  private async regenerateMenu(data: {menu_id: number, hotel_id: number}[]) {
    const promises = []
    data?.forEach(el => {
      promises.push(this.publishMenuService.regenerateMenu(el.menu_id, el.hotel_id));
    })
    return await Promise.allSettled(promises);
  }

  @OnEvent(ITEM_UPDATED_EVENT, { async: true })
  async onItemUpdated(itemId: number) {
    this.logger.log(`Event ${ITEM_UPDATED_EVENT} called`)
    const data = await this.getMenuHotelsByItem(itemId);
    await this.regenerateMenu(data);
  }

  @OnEvent(ITEM_DELETED_EVENT, { async: true })
  async onItemDeleted(itemId: number) {
    this.logger.log(`Event ${ITEM_DELETED_EVENT} called`)
    const data = await this.getMenuHotelsByItem(itemId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MODIFIER_UPDATED_EVENT, { async: true })
  async onModifierUpdated(modifierId: number) {
    this.logger.log(`Event ${MODIFIER_UPDATED_EVENT} called`)
    const data = await this.getMenuHotelsByModifier(modifierId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MODIFIER_DELETED_EVENT, { async: true })
  async onModifierDeleted(modifierId: number) {
    this.logger.log(`Event ${MODIFIER_DELETED_EVENT} called`)
    const data = await this.getMenuHotelsByModifier(modifierId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MENU_CATEGORY_UPDATED_EVENT, { async: true })
  async onMenuCategoryUpdated(menuCategoryId: number) {
    this.logger.log(`Event ${MENU_CATEGORY_UPDATED_EVENT} called`)
    const data = await this.getMenuHotelsByMenuCategory(menuCategoryId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MENU_ITEM_UPDATED_EVENT, { async: true })
  async onMenuItemUpdated(menuItemId: number) {
    this.logger.log(`Event ${MENU_ITEM_UPDATED_EVENT} called`)
    const data = await this.getMenuHotelsByMenuItem(menuItemId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MENU_ITEM_DELETED_EVENT, { async: true })
  async onMenuItemDeleted(menuItemId: number) {
    this.logger.log(`Event ${MENU_ITEM_DELETED_EVENT} called`)
    const data = await this.getMenuHotelsByMenuItem(menuItemId);
    await this.regenerateMenu(data);
  }

  @OnEvent(ITEM_OUT_OF_STOCK_EVENT, { async: true })
  async onItemOutOfStock(itemId: number) {
    this.logger.log(`Event ${ITEM_OUT_OF_STOCK_EVENT} called`)
    const data = await this.getMenuHotelsByItem(itemId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MENU_HOTEL_UPDATED_EVENT, { async: true })
  async onMenuHotelUpdate(data: MenuHotel[]) {
    this.logger.log(`Event ${MENU_HOTEL_UPDATED_EVENT} called with`);
    const preparedPayload = []
    data.forEach(menuHotel => {
      preparedPayload.push({
        menu_id: menuHotel.menuId,
        hotel_id: menuHotel.hotelId
      })
    })
    await this.regenerateMenu(preparedPayload)
  }

  @OnEvent(MERCHANT_HOTEL_UNASSIGN_EVENT, { async: true })
  async onMerchantHotelUnassign(hotel: Hotel) {
    this.logger.log(`Event ${MERCHANT_HOTEL_UNASSIGN_EVENT} called with`);

    if (hotel.menuId) {
      await this.regenerateMenu([{
        menu_id: hotel.menuId,
        hotel_id: hotel.id
      }])
    }
  }

  @OnEvent(MERCHANT_HOTEL_ASSIGN_EVENT, { async: true })
  async onMerchantHotelAssign(hotel: Hotel) {
    this.logger.log(`Event ${MERCHANT_HOTEL_ASSIGN_EVENT} called with`);

    if (hotel.menuId) {
      await this.regenerateMenu([{
        menu_id: hotel.menuId,
        hotel_id: hotel.id
      }])
    }
  }

  @OnEvent(MENU_CATEGORY_DELETED_EVENT, { async: true })
  async onMenuCategoryDeleted(menuCategoryId: number) {
    this.logger.log(`Event ${MENU_CATEGORY_DELETED_EVENT} called`)
    const data = await this.getMenuHotelsByMenuCategory(menuCategoryId);
    await this.regenerateMenu(data);
  }

  @OnEvent(MERCHANT_INACTIVE_EVENT, { async: true })
  async onMerchantInactive(merchantId: number) {
    this.logger.log(`Event ${MERCHANT_INACTIVE_EVENT} called`)
    const data = await this.getMerchantHotelMenus(merchantId);
    console.log(`data: `, data);
    await this.regenerateMenu(data);
  }

  @OnEvent(MEAL_PERIOD_DELETED_EVENT, { async: true })
  async onMealPeriodDeleted(merchantId: number) {
    this.logger.log(`Event ${MEAL_PERIOD_DELETED_EVENT} called`)
    const data = await this.getMerchantHotelMenus(merchantId);
    console.log(`data: `, data);
    await this.regenerateMenu(data);
  }
}
