import { MigrationInterface, QueryRunner } from "typeorm";

export class alterTableMerchantsAddEta1738061949694
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       ALTER TABLE merchants
      ADD COLUMN eta INT4 DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchants
      DROP COLUMN eta;
    `);
  }
}
