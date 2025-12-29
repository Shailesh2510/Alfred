import { MigrationInterface, QueryRunner } from "typeorm"

export class addMerchantIdMenuItemTable1675944727958 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE menu_item ADD column merchant_id INT
        `);
        await queryRunner.query(`
            alter table menu_item
            add constraint fk_merchant_id foreign key (merchant_id)
            references merchants(id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE menu_item DROP CONSTRAINT fk_merchant_id
        `);
        await queryRunner.query(`
            ALTER TABLE menu_item DROP COLUMN merchant_id
        `);
    }
}
