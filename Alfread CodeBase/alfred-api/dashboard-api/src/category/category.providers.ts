import { CATEGORY_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Category } from '../../database/entities/category.entity';

export const categoryProviders = [
  {
    provide: CATEGORY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Category),
    inject: [PG_DATA_SOURCE],
  }
];
