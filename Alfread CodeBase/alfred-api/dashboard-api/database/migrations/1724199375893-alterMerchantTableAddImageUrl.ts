import { MigrationInterface, QueryRunner } from "typeorm";
export class AlterMerchantTableAddImageUrl1724199375893
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='merchants' AND column_name='image_url'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `alter table merchants add column image_url TYPE varchar(255)`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table merchants drop column if exists image_url`
    );
  }
}
