import { DataSource } from 'typeorm';
import { PG_CONFIG, SEED_PG_CONFIG } from './pg_config';

export default new DataSource(process.env.SEED_DB ? SEED_PG_CONFIG : PG_CONFIG);
