import { MEAL_PERIOD_REPOSITORY, MERCHANT_HOTEL_REPOSITORY, MERCHANT_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Merchant, MerchantHotel } from '../../database/entities/merchant.entity';
import { MealPeriod } from 'database/entities/meal_period.entity';

export const merchantProviders = [
  {
    provide: MERCHANT_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Merchant),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MEAL_PERIOD_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MealPeriod),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MERCHANT_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MerchantHotel),
    inject: [PG_DATA_SOURCE],
  },

];
