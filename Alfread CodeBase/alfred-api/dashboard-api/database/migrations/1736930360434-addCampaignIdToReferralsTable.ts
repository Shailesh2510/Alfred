import { MigrationInterface, QueryRunner } from "typeorm";

export class addCampaignIdToReferralsTable1736930360434
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE referrals
      ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id)
      REFERENCES campaigns(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE referrals DROP CONSTRAINT fk_campaign_id
    `);
  }
}
