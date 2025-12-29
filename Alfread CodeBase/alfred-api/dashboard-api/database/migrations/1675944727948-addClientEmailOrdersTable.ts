import { MigrationInterface, QueryRunner } from "typeorm"

export class addClientEmailOrdersTable1675944727948 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column client_email varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column if exists client_email`);
    }
}
