import { CATEGORY_REPOSITORY, ITEM_CATEGORY_REPOSITORY, ITEM_MODIFIER_REPOSITORY, ITEM_REPOSITORY, MENU_ITEM_REPOSITORY, MODIFIER_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Item, ItemCategory, ItemModifier } from '../../database/entities/item.entity';
import { Category } from '../../database/entities/category.entity';
import { Modifier } from '../../database/entities/modifier.entity';
import { MenuItem } from 'database/entities/menu_item.entity';

export const itemProviders = [
  {
    provide: ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Item),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ITEM_CATEGORY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ItemCategory),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ITEM_MODIFIER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ItemModifier),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: CATEGORY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Category),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MODIFIER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Modifier),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MENU_ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuItem),
    inject: [PG_DATA_SOURCE],
  },
];
