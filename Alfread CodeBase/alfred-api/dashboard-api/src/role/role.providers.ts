import {
  ROLE_REPOSITORY,
  PG_DATA_SOURCE,
  ROLE_MERCHANT_REPOSITORY,
  ROLE_HOTEL_REPOSITORY,
  ROLE_PERMISSION_REPOSITORY,
} from '../../constants';
import { DataSource } from 'typeorm';
import {
  Role,
  RoleHotel,
  RoleMerchant,
  RolePermission,
} from '../../database/entities/role.entity';

export const roleProviders = [
  {
    provide: ROLE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ROLE_MERCHANT_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RoleMerchant),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ROLE_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleHotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ROLE_PERMISSION_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RolePermission),
    inject: [PG_DATA_SOURCE],
  },
];
