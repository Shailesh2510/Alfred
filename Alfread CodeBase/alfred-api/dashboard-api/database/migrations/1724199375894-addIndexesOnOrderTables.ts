import { MigrationInterface, QueryRunner } from "typeorm"

export class addIndexesOnOrderTables1724199375894 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_order_items_order_id
      on order_items(order_id);
    `);

    await queryRunner.query(`
      create index if not exists idx_order_item_modifiers_order_item_id
      on order_item_modifiers(order_item_id);
    `);

    await queryRunner.query(`
      create index if not exists idx_order_item_modifier_options_order_item_modifier_id
      on order_item_modifier_options(order_item_modifier_id);
    `);

    await queryRunner.query(`
      create index if not exists index_orders_status
      on orders (status);
    `);

    await queryRunner.query(`
      create index if not exists index_orders_updated_at
      on orders (updated_at);
    `);
    await queryRunner.query(`
      create index if not exists index_orders_order_number
      on orders (order_number);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
