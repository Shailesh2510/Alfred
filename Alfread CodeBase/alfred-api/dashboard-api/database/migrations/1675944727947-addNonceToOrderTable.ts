import { MigrationInterface, QueryRunner } from "typeorm"

export class addNonceToOrderTable1675944727947 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column nonce uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column if exists nonce`);
    }
}
