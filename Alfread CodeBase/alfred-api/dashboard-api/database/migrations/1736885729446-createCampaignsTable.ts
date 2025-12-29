import { MigrationInterface, QueryRunner } from "typeorm";

export class createCampaignsTable1736885729446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE campaigns (
        id INT PRIMARY KEY,
        version INT,
        name varchar(100) NOT NULL,
        description text NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP(6),
        deleted_at timestamptz
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS campaigns");
  }
}
