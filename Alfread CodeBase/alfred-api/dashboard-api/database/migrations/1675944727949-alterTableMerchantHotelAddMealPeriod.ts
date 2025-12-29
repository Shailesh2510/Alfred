import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableMerchantHotelAddMealPeriod1675944727949 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table merchant_hotel add column meal_period_id int`);
        await queryRunner.query(`
            alter table merchant_hotel
            add constraint fk_meal_period_id_meal_period foreign key (meal_period_id)
            references meal_period(id)
        `);
        await queryRunner.query(`
            alter table merchant_hotel
            drop constraint cstx_unique_merchant_hotel
        `);
        await queryRunner.query(`
            alter table merchant_hotel
            add constraint cstx_unique_merchant_hotel_meal_period unique (merchant_id, hotel_id, meal_period_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table merchant_hotel
            drop constraint cstx_unique_merchant_hotel_meal_period
        `);
        await queryRunner.query(`
            alter table merchant_hotel
            add constraint cstx_unique_merchant_hotel unique (merchant_id, hotel_id)
        `);
        await queryRunner.query(`
            alter table merchant_hotel
            drop constraint fk_meal_period_id_meal_period
        `);
        await queryRunner.query(`
            alter table merchant_hotel
            drop column meal_period_id
        `);
    }
}
