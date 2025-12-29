import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableOrdersAddOrderDate1675944727952 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table orders add column order_date timestamptz
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table orders drop column if exists order_date
        `);
    }
}
