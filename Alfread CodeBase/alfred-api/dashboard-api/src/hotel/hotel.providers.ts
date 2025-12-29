import { HOTEL_REPOSITORY, MEAL_PERIOD_REPOSITORY, MENU_HOTEL_REPOSITORY, MERCHANT_HOTEL_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Hotel } from '../../database/entities/hotel.entity';
import { MerchantHotel } from '../../database/entities/merchant.entity';
import { MealPeriod } from '../../database/entities/meal_period.entity';
import { MenuHotel } from 'database/entities/menu_hotel.entity';

export const hotelProviders = [
  {
    provide: HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Hotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MERCHANT_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MerchantHotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MEAL_PERIOD_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MealPeriod),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MENU_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MenuHotel),
    inject: [PG_DATA_SOURCE],
  },
];
