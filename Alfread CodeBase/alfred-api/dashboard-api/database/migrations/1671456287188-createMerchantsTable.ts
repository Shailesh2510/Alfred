import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHubsTable1671456287188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE merchants (
        id SERIAL,
        version int,
        name varchar(255) not null,
        coordinates point,
        city_id INT,
        tax_rate NUMERIC(3),
        contact_email varchar(255),
        contact_phone varchar(255),
        address_number varchar(255),
        address_street varchar(255),
        address_town varchar(255),
        address_zip_code varchar(50),
        is_active BOOL,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        FOREIGN KEY (city_id) REFERENCES cities (id),
        primary key (id)
    )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP TABLE IF EXISTS merchants');
  }
}
