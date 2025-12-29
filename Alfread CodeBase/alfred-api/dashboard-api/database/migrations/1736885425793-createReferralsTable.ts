import { MigrationInterface, QueryRunner } from "typeorm";

export class createReferralsTable1736885425793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE referrals (
        id SERIAL PRIMARY KEY,
        version INT,
        ambassador_id varchar(50) NOT NULL,
        campaign_id INT NOT NULL,
        ambassador_name varchar(100) NOT NULL,
        short_code varchar(50) NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP(6),
        deleted_at timestamptz
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS referrals");
  }
}
