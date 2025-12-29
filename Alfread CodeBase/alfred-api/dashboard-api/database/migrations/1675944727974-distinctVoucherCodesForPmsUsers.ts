import { MigrationInterface, QueryRunner } from "typeorm"

export class distinctVoucherCodesForPmsUsers1675944727974 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table voucher_codes add column hotel_web_code varchar(200);
        `);
        await queryRunner.query(`
            alter table voucher_codes add column last_name varchar(200);
        `);
        await queryRunner.query(`
            alter table voucher_codes add column room_number varchar(200)
        `);
        await queryRunner.query(`
            alter table voucher_codes add column date_allowed varchar(200)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
