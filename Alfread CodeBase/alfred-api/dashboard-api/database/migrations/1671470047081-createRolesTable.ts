import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRolesTable1671470047081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE role_type AS ENUM ('TENANT_ROLE', 'HOTEL_ROLE', 'MERCHANT_ROLE');
    `);
    await queryRunner.query(`
      CREATE TABLE roles (
        id SERIAL,
        version int,
        type role_type not null,
        name varchar(255) not null,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS roles');
    await queryRunner.query('DROP TABLE IF EXISTS role_hotel');
    await queryRunner.query('DROP TABLE IF EXISTS role_merchant');
    await queryRunner.query('DROP TYPE IF EXISTS role_type');
  }
}
