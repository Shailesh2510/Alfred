import { MigrationInterface, QueryRunner } from "typeorm"

export class addOrderDiscountCodeLogTable1675944727973 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create table order_discount_code_logs (
                id SERIAL,
                order_id int,
                discount_code_id int,
                discount_code varchar(255),
                client_number varchar(255),
                client_email varchar(255),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (order_id) references orders(id),
                foreign key (discount_code_id) references discount_codes(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
