import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableOrdersAddCancelOption1675944727951 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table orders add column cancel_option varchar(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table orders drop column if exists cancel_option
        `);
    }
}
