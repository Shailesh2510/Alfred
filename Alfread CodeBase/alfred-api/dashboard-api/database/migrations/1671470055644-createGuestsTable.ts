import { MigrationInterface, QueryRunner } from 'typeorm';

export class createClientTable1671470055644 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE guests (
        id SERIAL,
        version int,
        email varchar(255),
        first_name varchar(255),
        last_name varchar(255),
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
    queryRunner.query(`DROP TABLE IF EXISTS guests`);
  }
}
