import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterModifiersTableAddFreeModifierCount1721241820329
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='modifiers' AND column_name='free_modifier_count'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE modifiers ADD COLUMN free_modifier_count INT DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE modifiers DROP COLUMN free_modifier_count`
    );
  }
}
