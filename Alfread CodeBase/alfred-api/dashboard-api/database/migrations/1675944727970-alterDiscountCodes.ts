import { MigrationInterface, QueryRunner } from "typeorm"

export class alterDiscountCodes1675944727970 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE discount_code_type AS ENUM ('REGULAR', 'SINGLE_USER')`);
        await queryRunner.query(`CREATE TYPE discount_code_access_type AS ENUM ('ADMIN', 'HOTEL')`);
        await queryRunner.query(`CREATE TYPE discount_code_amount_type AS ENUM ('PERCENTAGE', 'AMOUNT')`);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN type discount_code_type
        `);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN access_type discount_code_access_type
        `);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN total_amount numeric(10,5)
        `);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN amount_type discount_code_amount_type
        `);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN description text
        `);
        await queryRunner.query(`
            ALTER TABLE discount_codes ADD COLUMN is_active boolean
        `);

        await queryRunner.query(`
            CREATE TABLE discount_code_hotel (
                id serial,
                discount_code_id int,
                hotel_id int,
                foreign key (discount_code_id) references discount_codes(id),
                foreign key (hotel_id) references hotels(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
