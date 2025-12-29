import { MigrationInterface, QueryRunner } from "typeorm"

export class alterHotelsTableAddMenuId1675944727932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table hotels add column menu_id int`);
        await queryRunner.query(`alter table hotels add foreign key (menu_id) references menus(id)`);
        await queryRunner.query(`alter table menu_item add constraint cx_price_new_price check (price <= new_price)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table hotels drop constraint hotels_menu_id_fkey`);
        await queryRunner.query(`alter table hotels drop column menu_id`);
        await queryRunner.query(`alter table menu_item drop constraint cx_price_new_price`);
    }
}
