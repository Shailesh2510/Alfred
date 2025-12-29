import { MigrationInterface, QueryRunner } from "typeorm"

export class alterMenuItemTableAddOrderPosition1675944727944 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table menu_item add column order_position smallint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table menu_item drop column order_position`);
    }
}
