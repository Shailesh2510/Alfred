import { MigrationInterface, QueryRunner } from "typeorm"

export class alterVoucherProgramRulesMenuCategories1675944727943 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table voucher_program_rules drop column category_ids`);
        await queryRunner.query(`alter table voucher_program_rules add column menu_category_ids jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table voucher_program_rules add column category_ids jsonb`);
        await queryRunner.query(`alter table voucher_program_rules drop column menu_category_ids`);
    }
}
