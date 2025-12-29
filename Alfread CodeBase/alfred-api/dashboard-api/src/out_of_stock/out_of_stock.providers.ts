import { OUT_OF_STOCK_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { OutOfStock } from '../../database/entities/out_of_stock.entity';

export const outOfStockProviders = [
  {
    provide: OUT_OF_STOCK_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OutOfStock),
    inject: [PG_DATA_SOURCE],
  },
]
