import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrdersAddAppliedVoucherAmount1675944727964 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders ADD COLUMN applied_voucher_amount numeric(10,5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
