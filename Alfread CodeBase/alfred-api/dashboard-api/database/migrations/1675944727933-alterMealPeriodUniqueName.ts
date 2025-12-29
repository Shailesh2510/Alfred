import { MigrationInterface, QueryRunner } from "typeorm"

export class alterMealPeriodUniqueName1675944727933 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table meal_period drop constraint meal_period_name_key`);
        await queryRunner.query(`alter table meal_period add constraint meal_period_merchant_id_name_key unique(merchant_id, name)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table meal_period drop constraint meal_period_merchant_id_name_key`);
        await queryRunner.query(`alter table meal_period add constraint meal_period_name_key unique(name)`);
    }
}
