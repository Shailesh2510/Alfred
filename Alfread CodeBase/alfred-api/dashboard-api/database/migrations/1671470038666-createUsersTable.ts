import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1671470038666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_type AS ENUM ('GUEST_USER', 'TENANT_USER', 'HOTEL_USER', 'MERCHANT_USER');
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL,
        version int,
        type user_type not null,
        email varchar(255) not null unique,
        first_name varchar(255),
        last_name varchar(255),
        username varchar(255) unique,
        phone_number varchar(255),
        is_active bool,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists users`);
    await queryRunner.query(`drop type if exists user_type`);
  }
}
