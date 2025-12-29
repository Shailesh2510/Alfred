import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableItemsAddOrderQuantity1736231167540
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='items' AND column_name='order_quantity'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE public.items ADD COLUMN order_quantity INT DEFAULT 1 NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.items DROP COLUMN order_quantity`
    );
  }
}
