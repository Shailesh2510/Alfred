import { MigrationInterface, QueryRunner } from "typeorm";
export class alterMerchantAddDescription1731345433032
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchants 
      ADD COLUMN description VARCHAR NOT NULL DEFAULT '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchants 
      DROP COLUMN description;
    `);
  }
}
