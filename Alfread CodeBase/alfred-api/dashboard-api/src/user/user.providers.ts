import {
  PG_DATA_SOURCE,
  USER_HOTEL_REPOSITORY,
  USER_MERCHANT_REPOSITORY,
  USER_REPOSITORY,
  USER_ROLE_REPOSITORY,
} from '../../constants';
import { DataSource } from 'typeorm';
import {
  User,
  UserHotel,
  UserMerchant,
  UserRole,
} from '../../database/entities/user.entity';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: USER_ROLE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserRole),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: USER_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserHotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: USER_MERCHANT_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserMerchant),
    inject: [PG_DATA_SOURCE],
  },
];
