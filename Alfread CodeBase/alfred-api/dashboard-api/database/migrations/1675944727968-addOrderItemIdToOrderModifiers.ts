import { MigrationInterface, QueryRunner } from "typeorm"

export class addOrderItemIdToOrderModifiers1675944727968 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE order_item_modifiers ADD COLUMN order_item_id INT
        `);
        await queryRunner.query(`
            ALTER TABLE order_item_modifier_options ADD COLUMN order_item_id INT
        `);
        await queryRunner.query(`
            ALTER TABLE order_item_modifiers
            ADD CONSTRAINT fk_order_item_modifiers_order_items
            FOREIGN KEY (order_item_id) REFERENCES order_items (id);
        `);
        await queryRunner.query(`
            ALTER TABLE order_item_modifier_options
            ADD CONSTRAINT fk_order_item_modifier_options_order_items
            FOREIGN KEY (order_item_id) REFERENCES order_items (id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
