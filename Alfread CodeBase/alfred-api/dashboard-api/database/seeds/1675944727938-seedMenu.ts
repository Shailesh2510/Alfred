import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuCategory } from '../entities/menu_category.entity';
import { MenuItem } from '../entities/menu_item.entity';
import { MenuHotel } from '../entities/menu_hotel.entity';
import { MerchantHotel } from 'database/entities/merchant.entity';

export class seedMenu1675944727938 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menu = {
      id: 1,
      version: 1,
      name: 'Main Menu',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const menuEntity = await queryRunner.manager.getRepository(Menu).save(menu);
    console.log({
      menuEntity
    })

    const itemCategories = await queryRunner.manager.query(
      `select ic.*, c.meal_period_id, c.name as category_name, i.price from item_category ic inner join items i on i.id = ic.item_id inner join categories c on c.id = ic.category_id`
    );

    const menuCategories = []
    const itemsMap = {}
    itemCategories.forEach((itemcategory, idx) => {
      const obj = {
        menuId: menuEntity.id,
        mealPeriodId: itemcategory.meal_period_id,
        name: `Menu category ${idx}`
      }
      itemsMap[obj.name] = {
        ...obj,
        itemId: itemcategory.item_id,
        price: itemcategory.price,
      }
      menuCategories.push(obj)
    })

    const menuCategoryEntities = await queryRunner.manager.getRepository(MenuCategory).save(menuCategories)
    const menuItems = []
    menuCategoryEntities.forEach((menuCategoryEntity, idx) => {
      const item = itemsMap[menuCategoryEntity.name]
      menuItems.push({
        itemId: item.itemId,
        menuId: menuEntity.id,
        menuCategoryId: menuCategoryEntity.id,
        price: item.price,
        newPrice: idx % 2 == 0 ? Number(item.price) + Number(item.price) * 0.01 : null
      })
    })

    await queryRunner.manager.getRepository(MenuItem).save(menuItems)

    const hotels = await queryRunner.manager.query(
      `select * from hotels`
    );
    const merchants = await queryRunner.manager.query(
      `select * from merchants`
    );

    const menuHotels = []
    const merchantHotels = []
    hotels.forEach(hotel => {
      menuHotels.push({
        hotelId: hotel.id,
        menuId: menuEntity.id
      })
      merchants.forEach(merchant => {
        merchantHotels.push({
          hotelId: hotel.id,
          merchantId: merchant.id
        })
      })
    })
    await queryRunner.manager.getRepository(MenuHotel).save(menuHotels)
    await queryRunner.manager.getRepository(MerchantHotel).save(merchantHotels)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM merchant_hotel where id > 0 ');
    await queryRunner.manager.query('DELETE FROM menu_hotel where id > 0 ');
    await queryRunner.manager.query('DELETE FROM menu_item where id > 0 ');
    await queryRunner.manager.query('DELETE FROM menu_category where id > 0 ');
    await queryRunner.manager.query('DELETE FROM menus where id > 0 ');
  }
}
