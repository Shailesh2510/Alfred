import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterHotelsTableAddEnableAutomaticTip1725467830964
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='hotels' AND column_name='enable_automatic_tip'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `alter table hotels add column enable_automatic_tip TYPE BOOLEAN DEFAULT false`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table hotels drop column if exists enable_automatic_tip`
    );
  }
}
