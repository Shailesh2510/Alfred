import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterMerchantHotelAddOrderPosition1732814055385
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchant_hotel
      ADD COLUMN order_position INT NULL DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchant_hotel
      DROP COLUMN order_position;
    `);
  }
}
