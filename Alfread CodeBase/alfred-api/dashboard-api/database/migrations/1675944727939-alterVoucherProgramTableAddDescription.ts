import { MigrationInterface, QueryRunner } from "typeorm"

export class alterVoucherProgramTableAddDescription1675944727939 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table voucher_programs add column description text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table voucher_programs drop column if exists description`);
    }
}
