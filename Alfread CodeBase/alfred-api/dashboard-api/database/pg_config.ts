require('dotenv').config()
import { DataSourceOptions } from 'typeorm';
import {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_TYPE,
  DB_PORT
} from '../constants';
import { TypeOrmLoggerContainer } from 'src/logger';

console.log({
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_TYPE,
})

export const PG_CONFIG: DataSourceOptions = {
  type: DB_TYPE,
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  connectTimeoutMS: 120000,
  logging: true,
  logger: TypeOrmLoggerContainer.ForConnection("", true),
};

export const SEED_PG_CONFIG: DataSourceOptions = {
  type: DB_TYPE,
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/seeds/*.ts'],
  migrationsTableName: 'seeds',
  synchronize: false,
};
