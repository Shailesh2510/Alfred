import { MigrationInterface, QueryRunner } from "typeorm"

export class alterAmountUsedVouchers1675944727961 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE voucher_programs drop column amount_used`);
        await queryRunner.query(`ALTER TABLE voucher_codes add column amount_used numeric(10,5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE voucher_codes drop column amount_used`);
        await queryRunner.query(`ALTER TABLE voucher_programs add column amount_used numeric(10,5)`);
    }
}
