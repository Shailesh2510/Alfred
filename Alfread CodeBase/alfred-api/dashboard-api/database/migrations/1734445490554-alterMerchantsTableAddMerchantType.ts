import { MigrationInterface, QueryRunner } from "typeorm";

export class alterMerchantsTableAddMerchantType1734445490554
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "merchant_type" AS ENUM ('ROOM_SERVICE', 'RIDES');
    `);

    await queryRunner.query(`
      ALTER TABLE "merchants"
      ADD COLUMN "merchant_type" "merchant_type" NOT NULL DEFAULT 'ROOM_SERVICE';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants"
      DROP COLUMN "merchant_type";
    `);

    await queryRunner.query(`
      DROP TYPE "merchant_type";
    `);
  }
}
