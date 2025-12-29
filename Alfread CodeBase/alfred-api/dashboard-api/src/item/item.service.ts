import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { MODIFIER_REPOSITORY, CATEGORY_REPOSITORY, ITEM_REPOSITORY, ITEM_CATEGORY_REPOSITORY, ITEM_MODIFIER_REPOSITORY, PG_DATA_SOURCE, MENU_ITEM_REPOSITORY } from '../../constants';
import { Category } from '../../database/entities/category.entity';
import { DataSource, In, Repository } from 'typeorm';
import { APICreateItemDTO, CreateItemDTO } from './dto/create-item.dto';
import { UpdateItemDTO } from './dto/update-item.dto';
import { Modifier } from '../../database/entities/modifier.entity';
import { Item, ItemCategory, ItemModifier } from '../../database/entities/item.entity';
import { MenuCategoryVM } from 'src/menu_category/vm/menu-category.vm';
import { MenuItem } from 'database/entities/menu_item.entity';

@Injectable()
export class ItemService {
  logger = new Logger();
  @Inject(CATEGORY_REPOSITORY)
  private readonly categoryRepository: Repository<Category>;
  @Inject(MODIFIER_REPOSITORY)
  private readonly modifierRepository: Repository<Modifier>;
  @Inject(ITEM_REPOSITORY)
  private readonly itemRepository: Repository<Item>;
  @Inject(ITEM_CATEGORY_REPOSITORY)
  private readonly itemCategoryRepository: Repository<ItemCategory>;
  @Inject(ITEM_MODIFIER_REPOSITORY)
  private readonly itemModifierRepository: Repository<ItemModifier>;
  @Inject(MENU_ITEM_REPOSITORY)
  private readonly menuItemRepository: Repository<MenuItem>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  private async getModifiers(ids: number[], merchantId: number) {
    return await this.modifierRepository.find({
      where: {
        id: In(ids),
        merchantId
      }
    });
  }

  private async getUncategorizedCategoryForMealPeriods(mealPeriodIds: number[], merchantId: number) {
    const data = await this.categoryRepository.find({
      where: {
        mealPeriodId: In(mealPeriodIds),
        merchantId
      }
    })
    if (data.length) {
      return data;
    }
    throw new HttpException(`Meal period not found`, HttpStatus.CONFLICT);
  }

  async batchAssignToMealPeriod(merchantId: number, mealPeriodId: number, itemIds: number[]) {
    const categories = await this.getUncategorizedCategoryForMealPeriods([mealPeriodId], merchantId);
    const items = await this.findById(itemIds, merchantId);
    if (items.length !== itemIds.length) {
      throw new HttpException(`Item ids inconsistency`, HttpStatus.BAD_REQUEST);
    }
    const promises = []
    items.forEach((item) => {
      promises.push(this.saveItemCategories(categories, item.id, merchantId))
    })

    try {
      await Promise.all(promises)
    } catch (err) {
      // A unique constraint violating merchant_id_item_id_category_id_key could be thrown if duplicate entry is being attempted
      // but we can ignore it since we don't need it to fail
      this.logger.error(`Known error @ batchAssignToMealPeriod: ${err.message}`)
    }

    return true
  }

  async create(createItemDTO: APICreateItemDTO, merchantId: number) {
    const subcategories = await this.getUncategorizedCategoryForMealPeriods(createItemDTO.mealPeriodIds, merchantId);
    let modifiers = []
    if (createItemDTO.modifierIds && createItemDTO.modifierIds.length) {
      modifiers = await this.getModifiers(createItemDTO.modifierIds, merchantId);
      if (modifiers.length !== createItemDTO.modifierIds.length) {
        throw new HttpException(
          'Modifier not found',
          HttpStatus.NOT_FOUND,
        );
      }
    }
    const item = await this.itemRepository.save({
      name: createItemDTO.name,
      merchantId,
      ...createItemDTO,
      price: Number(createItemDTO.price),
      promoPrice: createItemDTO.promoPrice ? Number(createItemDTO.promoPrice) : null
    });
    try {
      await this.saveItemCategories(subcategories, item.id, merchantId)
    } catch (err) {
      this.logger.log(`ItemService@create: itemCategories ${err.message}`) 
      await this.itemRepository.delete({
        id: item.id
      })
      throw new HttpException(`Error saving categories`, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    
    try {
      if (modifiers.length) {
        await this.saveModifiers(modifiers, item.id, merchantId)
      }
    } catch (err) {
      this.logger.log(`ItemService@create: itemModifiers ${err.message}`) 
      await this.itemRepository.delete({
        id: item.id
      })
      await this.itemCategoryRepository.delete({
        id: In(subcategories.map((sub) => sub.id))
      })
      throw new HttpException(`Error saving modifiers`, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    
    return await this.findOne(item.id, merchantId);
  }

  private async saveItemCategories(categories: Category[], itemId: number, merchantId: number) {
    return await this.itemCategoryRepository.save(categories.map((subcategory) => {
      return {
        categoryId: subcategory.id,
        itemId,
        merchantId,
      }
    }));
  }

  private async saveModifiers(modifiers: Modifier[], itemId: number, merchantId: number) {
    return await this.itemModifierRepository.save(modifiers.map((modifier) => {
      return {
        modifierId: modifier.id,
        itemId,
        merchantId,
      }
    }));
  }

  private getQueryBuilder(merchantId: number) {
    return this.connection
      .createQueryBuilder()
      .select(
        `
        i.*,
        json_agg(distinct jsonb_build_object(
          'id', c.id,
          'version', c.version,
          'name', c.name
        )) as categories,
        json_agg(distinct jsonb_build_object(
          'id', mp.id,
          'version', mp.version,
          'name', mp.name
        )) as meal_periods,
        oos.id as out_of_stock_id,
        oos.available_after as out_of_stock_available_after
      `,
      )
      .from('items', 'i')
      .leftJoin('item_category', 'ic', 'i.id = ic.item_id')
      .leftJoin('categories', 'c', 'c.id = ic.category_id and c.deleted_at is null')
      .leftJoin('meal_period', 'mp', 'mp.id = c.meal_period_id and mp.deleted_at is null')
      .leftJoin('out_of_stock', 'oos', 'oos.item_id = i.id')
      .where('i.merchant_id = :merchantId')
      .andWhere('c.merchant_id = :merchantId')
      .setParameter('merchantId', merchantId)
      .groupBy('i.id, oos.id')
  }

  private getQueryBuilderWithMenuItem(merchantId: number, menuId: number) {
    return this.connection
      .createQueryBuilder()
      .select(
        `
        i.*,
        json_agg(distinct jsonb_build_object(
          'id', c.id,
          'version', c.version,
          'name', c.name
        )) as categories,
        json_agg(distinct jsonb_build_object(
          'id', mp.id,
          'version', mp.version,
          'name', mp.name
        )) as meal_periods,
        oos.id as out_of_stock_id,
        oos.available_after as out_of_stock_available_after,
        mi.order_position,
        mi.new_price,
        mi.menu_category_id
      `,
      )
      .from('items', 'i')
      .leftJoin('menu_item', 'mi', 'mi.item_id = i.id AND mi.menu_id = :menuId')
      .leftJoin('item_category', 'ic', 'i.id = ic.item_id')
      .leftJoin('categories', 'c', 'c.id = ic.category_id and c.deleted_at is null')
      .innerJoin('meal_period', 'mp', 'mp.id = c.meal_period_id and mp.deleted_at is null')
      .leftJoin('out_of_stock', 'oos', 'oos.item_id = i.id')
      .where('i.merchant_id = :merchantId')
      .andWhere('c.merchant_id = :merchantId')
      .setParameter('merchantId', merchantId)
      .setParameter('menuId', menuId)
      .groupBy('i.id, oos.id, mi.id')
  }

  async getItemModifiers(itemIds: number[]) {
    return await this.connection
      .createQueryBuilder()
      .select(`
        m.*, im.item_id, COALESCE(json_agg(jsonb_build_object(
          'id', mo.id,
          'name', mo.name,
          'price', mo.price
          )) FILTER (WHERE mo.id IS NOT NULL), '[]') as options
      `)
      .from('item_modifier', 'im')
      .innerJoin('modifiers', 'm', 'm.id = im.modifier_id')
      .leftJoin('modifier_options', 'mo', 'mo.modifier_id = m.id and mo.deleted_at is null')
      .where('im.item_id in (:...itemIds)')
      .groupBy('m.id, im.item_id')
      .setParameter('itemIds', itemIds)
      .getRawMany()
  }

  async findAll(merchantId: number) {
    const qb = this.getQueryBuilder(merchantId);
    return await qb.getRawMany();
  }

  async findAllWithMenuItem(merchantId: number, menuId: number) {
    const qb = this.getQueryBuilderWithMenuItem(merchantId, menuId);
    return await qb.getRawMany();
  }

  async findById(ids: number[], merchantId?: number) {
    return await this.itemRepository.find({
      where: {
        id: In(ids),
        ...(merchantId ? {merchantId} : null)
      }
    })
  }

  async findWithMenuItem(itemIds: number[], merchantId: number, menuId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(`
        i.*, mi.new_price, mi.menu_category_id
      `)
      .from('items', 'i')
      .innerJoin('menu_item', 'mi', 'mi.item_id = i.id')
      .where('i.id in (:...itemIds)')
      .andWhere('i.merchant_id = :merchantId')
      .andWhere('mi.menu_id = :menuId')
      .setParameter('itemIds', itemIds)
      .setParameter('merchantId', merchantId)
      .setParameter('menuId', menuId)
      .getRawMany()
  }

  async findOne(id: number, merchantId: number) {
    const item = await this.getQueryBuilder(merchantId)
      .andWhere('i.id = :id')
      .setParameter('id', id)
      .getRawOne()
    if (!item) {
      throw new HttpException(`Item does not exist`, HttpStatus.NOT_FOUND)
    }
    const modifiers = await this.getItemModifiers([id]);
    return {
      ...item,
      modifiers
    }
    
  }

  async findOneById(id: number) {
    const entity = await this.itemRepository.findOneBy({
      id,
    });
    if (!entity) {
      throw new HttpException(`Item does not exist`, HttpStatus.NOT_FOUND)
    }
    return entity;
  }

  private async getAssociatedMenuMealPeriodIds(itemId: number) {
    const data = await this.connection.createQueryBuilder()
      .select(`mc.*`)
      .from('menu_item', 'mi')
      .innerJoin('menu_category', 'mc', 'mc.id = mi.menu_category_id')
      .where('mi.item_id = :itemId')
      .setParameter('itemId', itemId)
      .getRawMany();
    const menuCategories = new MenuCategoryVM(data).build();
    const mealPeriodMap = {}
    menuCategories.forEach(menuCategory => {
      mealPeriodMap[menuCategory.mealPeriodId] = true
    })
    return mealPeriodMap
  }

  private async validateItemMealPeriodChange(itemId: number, mealPeriodIds: number[]) {
    if (!mealPeriodIds) {
      return;
    }
    const existingMenuMealPeriodIdsMap = await this.getAssociatedMenuMealPeriodIds(itemId);
    let counter = 0
    mealPeriodIds.forEach(updatingMealPeriodId => {
      if (existingMenuMealPeriodIdsMap[updatingMealPeriodId]) {
        counter += 1
      }
    })

    if (counter !== Object.keys(existingMenuMealPeriodIdsMap).length) {
      throw new HttpException(`Cannot delete meal periods that this item is associated in menu`, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateItemDTO: UpdateItemDTO, merchantId: number) {
    //todo: need to put everything under transactional flow - this is just poc
    await this.findOne(id, merchantId);
    await this.validateItemMealPeriodChange(id, updateItemDTO.mealPeriodIds);
    const categories = await this.getUncategorizedCategoryForMealPeriods(updateItemDTO.mealPeriodIds, merchantId);
    let modifiers = []
    if (updateItemDTO.modifierIds && updateItemDTO.modifierIds.length) {
      modifiers = await this.getModifiers(updateItemDTO.modifierIds, merchantId);
      if (modifiers.length == 0) {
        throw new HttpException(`Item modifiers not found`, HttpStatus.NOT_FOUND)
      }
    }
    await this.itemCategoryRepository.delete({
      itemId: id,
      merchantId
    });
    await this.itemModifierRepository.delete({
      itemId: id,
      merchantId
    });
    
    await this.saveItemCategories(categories, id, merchantId)
    if (modifiers.length) {
      await this.saveModifiers(modifiers, id, merchantId)
    }

    delete updateItemDTO.modifierIds; //no need to have inside update
    delete updateItemDTO.mealPeriodIds; //no need to have inside update

    const existingItem = await this.itemRepository.findOne({where: {
      id
    }})

    await this.itemRepository.update(
      {
        id,
        merchantId
      },
      {
        ...updateItemDTO,
        price: updateItemDTO.price ? Number(updateItemDTO.price): existingItem.price,
        promoPrice: updateItemDTO.promoPrice ? 
          +updateItemDTO.promoPrice === 0 ? null :
          Number(updateItemDTO.promoPrice) : existingItem.promoPrice
      },
    );

    const item = await this.findOne(id, merchantId)
    await this.menuItemRepository.update({
      itemId: id,
    }, {
      price: item.price,
    });
    return item;
  }

  async remove(id: number, merchantId: number) {
    const entity = await this.itemRepository.findOne({where: {
        id,
        merchantId
      }
    })

    if (!entity) {
      throw new HttpException(`Item does not exist`, HttpStatus.BAD_REQUEST)
    }

    try {
      await this.itemRepository.softDelete({
        id
      })
    } catch (err) {
      this.logger.error(`Error@modifier.remove: ${err.message}`)
      throw new HttpException(`Something went wrong deleting modifier`, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    return true;
  }
}
