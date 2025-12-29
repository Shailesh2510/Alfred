import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHubHotelTable1671457041023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE merchant_hotel (
        id SERIAL PRIMARY KEY,
        merchant_id int,
        hotel_id int,
        foreign key (merchant_id) references merchants(id),
        foreign key (hotel_id) references hotels(id),
        CONSTRAINT cstx_unique_merchant_hotel UNIQUE (merchant_id, hotel_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE merchant_service (
        id SERIAL,
        merchant_id int,
        service_id int,
        foreign key (merchant_id) references merchants (id),
        foreign key (service_id) references services (id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS merchant_hotel`);
    await queryRunner.query(`DROP TABLE IF EXISTS merchant_service`);
  }
}
