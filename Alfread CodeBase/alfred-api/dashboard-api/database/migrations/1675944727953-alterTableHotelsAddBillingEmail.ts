import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableHotelsAddBillingEmail1675944727953 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table hotels add column billing_email varchar(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table orders drop column if exists billing_email
        `);
    }
}
