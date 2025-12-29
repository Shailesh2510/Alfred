import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableVoucherProgramsIsActive1675944727950 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table voucher_programs add column is_active bool default true 
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table voucher_programs drop column if exists is_active
        `);
    }
}
