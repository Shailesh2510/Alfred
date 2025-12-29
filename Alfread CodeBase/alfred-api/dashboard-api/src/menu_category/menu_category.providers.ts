import { MENU_CATEGORY_REPOSITORY, MENU_ITEM_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { DataSource } from "typeorm";
import { MenuCategory } from "../../database/entities/menu_category.entity";
import { MenuItem } from "../../database/entities/menu_item.entity";

export const menuCategoryProviders = [
  {
    provide: MENU_CATEGORY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuCategory),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MENU_ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuItem),
    inject: [PG_DATA_SOURCE],
  },
];
