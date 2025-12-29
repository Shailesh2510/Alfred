import { MigrationInterface, QueryRunner } from "typeorm"

export class alterItemCategoryTable1675944727934 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table item_category add constraint merchant_id_item_id_category_id_key unique(merchant_id, item_id, category_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table meal_period drop constraint merchant_id_item_id_category_id_key`);
    }
}
