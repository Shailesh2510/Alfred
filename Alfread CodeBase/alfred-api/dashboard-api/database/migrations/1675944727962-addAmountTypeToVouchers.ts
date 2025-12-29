import { MigrationInterface, QueryRunner } from "typeorm"

export class addAmountType1675944727962 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE amount_type_enum AS ENUM ('PERCENTAGE', 'FIXED')`)
        await queryRunner.query(`ALTER TABLE voucher_programs add column amount_type amount_type_enum default 'FIXED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE voucher_programs drop column amount_type`);
    }
}
