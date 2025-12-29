import { MigrationInterface, QueryRunner } from "typeorm"

export class addOrderItemModifierIdToOrderItemModifierOptions1675944727969 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE order_item_modifier_options ADD COLUMN order_item_modifier_id INT
        `);
        await queryRunner.query(`
            ALTER TABLE order_item_modifier_options
            ADD CONSTRAINT fk_order_item_modifier_options_order_item_modifiers
            FOREIGN KEY (order_item_modifier_id) REFERENCES order_item_modifiers (id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
