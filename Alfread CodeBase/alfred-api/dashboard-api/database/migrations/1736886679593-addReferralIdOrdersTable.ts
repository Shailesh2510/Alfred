import { MigrationInterface, QueryRunner } from "typeorm";

export class addReferralIdOrdersTable1736886679593
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders ADD column referral_id INT
    `);

    await queryRunner.query(`
      ALTER TABLE orders
      ADD CONSTRAINT fk_referral_id FOREIGN KEY (referral_id)
      REFERENCES referrals(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders DROP CONSTRAINT fk_referral_id
    `);

    await queryRunner.query(`
      ALTER TABLE orders DROP COLUMN referral_id
    `);
  }
}
