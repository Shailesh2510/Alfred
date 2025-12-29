import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTenantsTable1671455018810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE service_type AS ENUM ('HOTEL_SERVICE', 'MERCHANT_SERVICE');
    `);
    await queryRunner.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        name varchar(255) unique,
        type service_type
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS services');
    await queryRunner.query('DROP TYPE IF EXISTS service_type');
  }
}
