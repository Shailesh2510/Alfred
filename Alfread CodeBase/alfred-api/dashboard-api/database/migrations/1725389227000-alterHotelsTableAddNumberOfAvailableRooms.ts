import { MigrationInterface, QueryRunner } from "typeorm";
export class AlterHotelsTableAddNumberOfAvailableRooms1725389227000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column already exists
    const columnExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='hotels' AND column_name='number_of_available_rooms'`
    );
    if (columnExists.length === 0) {
      await queryRunner.query(
        `alter table hotels add column number_of_available_rooms INT`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table hotels drop column if exists number_of_available_rooms`
    );
  }
}
