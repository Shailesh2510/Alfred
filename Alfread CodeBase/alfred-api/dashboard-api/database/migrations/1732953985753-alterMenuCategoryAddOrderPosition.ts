import { MigrationInterface, QueryRunner } from "typeorm";

export class alterMenuCategoryAddOrderPosition1732953985753
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE menu_category
      ADD COLUMN order_position INT NULL DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE menu_category 
      DROP COLUMN order_position;
    `);
  }
}
