import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderTableAddCancelReason1675944727936 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column cancel_reason text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column if exists cancel_reason`);
    }
}
