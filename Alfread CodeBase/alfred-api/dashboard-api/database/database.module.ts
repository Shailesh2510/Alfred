import { PG_DATA_SOURCE } from '../constants';
import { Module } from '@nestjs/common';
import dataSource from './datasource';

export const databaseProviders = [
  {
    provide: PG_DATA_SOURCE,
    useFactory: async () => {
      try {
        return await dataSource.initialize()
      } catch (err) {
        console.log('[err-connect-db]: ', err)
      }
    },
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
