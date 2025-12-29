import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHotelsTable1671456698443 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE hotels (
        id SERIAL,
        version int,
        name varchar(255) not null,
        formal_name varchar(255),
        address_number SMALLINT,
        address_street varchar(255),
        address_town varchar(150),
        address_zip_code varchar(50),
        contact_name varchar(255),
        contact_email varchar(255),
        contact_phone varchar(255),
        code varchar(50),
        web_code varchar(50),
        allow_credit_card bool,
        allow_room_charge bool,
        is_tax_exempt bool,
        rooms jsonb,
        coordinates point,
        is_active boolean,
        delivery_instructions text,
        is_web_enabled bool,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE hotel_service (
        id SERIAL,
        hotel_id int,
        service_id int,
        foreign key (hotel_id) references hotels (id),
        foreign key (service_id) references services (id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS hotel_service`);
    await queryRunner.query(`DROP TABLE IF EXISTS hotels`);
  }
}
