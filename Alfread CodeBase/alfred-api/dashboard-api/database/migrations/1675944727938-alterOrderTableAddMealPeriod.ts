import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderTableAddMealPeriod1675944727938 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column meal_period_id int`);
        await queryRunner.query(`alter table orders add foreign key (meal_period_id) references meal_period (id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop constraint orders_meal_period_id_fkey`);
        await queryRunner.query(`alter table orders drop column if exists meal_period_id`);
    }
}
