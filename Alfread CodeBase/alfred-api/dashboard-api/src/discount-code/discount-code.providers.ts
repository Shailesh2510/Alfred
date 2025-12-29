import { DISCOUNT_CODE_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { DiscountCode } from '../../database/entities/discount-code.entity';

export const discountCodeProviders = [
  {
    provide: DISCOUNT_CODE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DiscountCode),
    inject: [PG_DATA_SOURCE],
  }
];
