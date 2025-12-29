import { MigrationInterface, QueryRunner } from "typeorm";
export class AlterOrderTableAddHasAlcohol1720425547920
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column already exists
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='orders' AND column_name='has_alcohol'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `alter table orders add column has_alcohol boolean`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table orders drop column if exists has_alcohol`
    );
  }
}
