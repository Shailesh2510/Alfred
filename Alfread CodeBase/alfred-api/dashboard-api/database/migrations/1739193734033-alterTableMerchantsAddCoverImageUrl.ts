import { MigrationInterface, QueryRunner } from "typeorm";

export class alterTableMerchantsAddCoverImageUrl1739193734033
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchants
      ADD COLUMN cover_image_url VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE merchants
      DROP COLUMN cover_image_url;
    `);
  }
}
