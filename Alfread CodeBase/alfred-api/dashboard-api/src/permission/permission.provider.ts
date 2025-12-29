import { PERMISSION_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Permission } from '../../database/entities/permission.entity';

export const permissionProviders = [
  {
    provide: PERMISSION_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Permission),
    inject: [PG_DATA_SOURCE],
  },
];
