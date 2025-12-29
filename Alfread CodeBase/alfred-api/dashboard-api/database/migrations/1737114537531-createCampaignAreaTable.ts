import { MigrationInterface, QueryRunner } from "typeorm";

export class createCampaignAreaTable1737114537531
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE campaign_area (
        id SERIAL PRIMARY KEY,
        campaign_id INT NOT NULL,
        area_id INT NOT NULL,
        airport_code VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMPTZ,
        FOREIGN KEY (area_id) REFERENCES areas(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) 
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS campaign_area");
  }
}
