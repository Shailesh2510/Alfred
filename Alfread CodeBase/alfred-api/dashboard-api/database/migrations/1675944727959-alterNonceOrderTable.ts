import { MigrationInterface, QueryRunner } from "typeorm"

export class alterNonceOrderTable1675944727959 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders alter column nonce set data type varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders alter column nonce set data type uuid`);
    }
}
