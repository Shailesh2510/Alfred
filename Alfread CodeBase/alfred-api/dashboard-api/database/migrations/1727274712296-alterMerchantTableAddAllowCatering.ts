import { MigrationInterface, QueryRunner } from "typeorm";
export class alterMerchantTableAddAllowCatering1727274712296
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='merchants' AND column_name='allow_catering'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `alter table merchants add column allow_catering TYPE BOOLEAN DEFAULT false`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table merchants drop column if exists allow_catering`
    );
  }
}
