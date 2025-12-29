import { CITY_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { City } from '../../database/entities/city.entity';

export const cityProviders = [
  {
    provide: CITY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(City),
    inject: [PG_DATA_SOURCE],
  },
];
