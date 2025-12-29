import { MigrationInterface, QueryRunner } from "typeorm"

export class createOutOfStockTable1675944727942 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create table out_of_stock (
                id serial,
                merchant_id int,
                item_id int,
                available_after timestamptz,
                foreign key (merchant_id) references merchants(id),
                foreign key (item_id) references items(id),
                primary key (id),
                constraint out_of_stock_unique_item_id unique (item_id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table if exists out_of_stock`);
    }
}
