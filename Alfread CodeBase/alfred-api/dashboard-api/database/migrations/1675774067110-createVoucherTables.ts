import { MigrationInterface, QueryRunner } from "typeorm"

export class createVoucherTables1675774067110 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE voucher_program_payer AS ENUM ('HOTEL', 'TENANT');`);
        await queryRunner.query(`CREATE TYPE voucher_program_type AS ENUM ('DISCOUNT', 'PER_DIEM', 'PRE_FIXE');`);
        await queryRunner.query(`
            create table voucher_programs(
                id serial,
                version int,
                name varchar(255),
                type voucher_program_type,
                payer voucher_program_payer,
                payer_percentage numeric(10,5),
                total_amount numeric(10,5),
                amount_used numeric(10,5),
                refund_amount numeric(10,5),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id)
            );
        `);
        await queryRunner.query(`
            create table voucher_codes(
                id serial,
                version int,
                voucher_program_id int,
                code varchar(10) unique,
                claimed_date timestamptz,
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (voucher_program_id) references voucher_programs(id)
            );        
        `);
        await queryRunner.query(`
                create table voucher_program_hotel (
                    id serial,
                    voucher_program_id int,
                    hotel_id int,
                    primary key (id),
                    foreign key (voucher_program_id) references voucher_programs (id),
                    foreign key (hotel_id) references hotels (id)
                )
        `);
        await queryRunner.query(`
            create table voucher_program_rules (
                id serial,
                version int,
                voucher_program_id int,
                meal_period_id int,
                category_ids jsonb,
                quantity int,
                max_price numeric(10,5),
                primary key (id),
                foreign key (voucher_program_id) references voucher_programs (id),
                foreign key (meal_period_id) references meal_period (id)
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS voucher_program_rules`);
        await queryRunner.query(`DROP TABLE IF EXISTS voucher_program_hotel`);
        await queryRunner.query(`DROP TABLE IF EXISTS voucher_codes`);
        await queryRunner.query(`DROP TABLE IF EXISTS voucher_programs`);
        await queryRunner.query(`DROP TYPE IF EXISTS voucher_program_type`);
        await queryRunner.query('DROP TYPE IF EXISTS voucher_program_payer');
    }

}
