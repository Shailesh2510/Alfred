import { MigrationInterface, QueryRunner } from "typeorm";

export class createAreasTable1737114500178 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        postal_codes VARCHAR(40000) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS areas");
  }
}
