import { HOTEL_REPOSITORY, ITEM_REPOSITORY, MENU_HOTEL_REPOSITORY, MENU_ITEM_REPOSITORY, MENU_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { Menu } from "../../database/entities/menu.entity";
import { DataSource } from "typeorm";
import { MenuItem } from "../../database/entities/menu_item.entity";
import { MenuHotel } from "../../database/entities/menu_hotel.entity";
import { Hotel } from "../../database/entities/hotel.entity";
import { Item } from "../../database/entities/item.entity";

export const menuProviders = [
  {
    provide: MENU_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Menu),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MENU_ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuItem),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MENU_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuHotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Hotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Item),
    inject: [PG_DATA_SOURCE],
  },
];