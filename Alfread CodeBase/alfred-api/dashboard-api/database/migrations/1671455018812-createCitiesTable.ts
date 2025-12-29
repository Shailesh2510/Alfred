import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCityTable1671455018812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
    CREATE TABLE cities (
      id SERIAL,
      version int,
      name varchar(150) not null,
      state varchar(15) not null,
      zip_code varchar(50) not null,
      timezone varchar(50),
      created_at timestamptz default CURRENT_TIMESTAMP(6),
      updated_at timestamptz default CURRENT_TIMESTAMP(6),
      deleted_at timestamptz,
      primary key (id)
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP TABLE IF EXISTS cities');
  }
}
