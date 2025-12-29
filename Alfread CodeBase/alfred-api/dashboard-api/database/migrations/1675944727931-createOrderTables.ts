import { MigrationInterface, QueryRunner } from "typeorm"

export class createOrderTables1675944727931 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE order_type AS ENUM ('ROOM_CHARGE', 'CREDIT_CARD');
        `);
        await queryRunner.query(`
            CREATE TYPE order_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'PREPARATION', 'IN_DELIVERY', 'DELIVERED', 'CANCELED', 'SCHEDULED');
        `);
        await queryRunner.query(`
            create table orders(
                id SERIAL,
                version int,
                hotel_id int,
                merchant_id int,
                order_number int,
                status order_status_enum,
                scheduled_date timestamptz,
                client_name varchar(255),
                client_number varchar(255),
                order_type order_type,
                voucher_code varchar(10),
                voucher_code_id int,
                receipt_amount numeric(10,5),
                total_net numeric(10,5),
                tax_amount numeric(10,5),
                total_gross numeric(10,5),
                grand_total numeric(10,5),
                voucher_price numeric(10,5),
                refund_amount numeric(10,5),
                hotel_total_net numeric(10,5),
                hotel_tax_amount numeric(10,5),
                hotel_total_gross numeric(10,5),
                hotel_grand_total numeric(10,5),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (voucher_code_id) references voucher_codes(id),
                foreign key (hotel_id) references hotels(id),
                foreign key (merchant_id) references merchants(id)
            );
        `);
        await queryRunner.query(`
            create table order_calculations(
                id serial,
                order_id int,
                version int,
                receipt_amount numeric(10,5),
                total_net numeric(10,5),
                tax_amount numeric(10,5),
                total_gross numeric(10,5),
                grand_total numeric(10,5),
                voucher_price numeric(10,5),
                refund_amount numeric(10,5),
                hotel_total_net numeric(10,5),
                hotel_tax_amount numeric(10,5),
                hotel_total_gross numeric(10,5),
                hotel_grand_total numeric(10,5),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (order_id) references orders (id)
            );
        `);
        await queryRunner.query(`
            create table order_items(
                id SERIAL,
                version int,
                order_id int,
                item_id int,
                item_name varchar(255),
                quantity int,
                price decimal,
                voucher_code varchar(10),
                voucher_code_id int,
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (item_id) references items (id),
                foreign key (voucher_code_id) references voucher_codes (id),
                foreign key (order_id) references orders (id)
            );
        `);
        await queryRunner.query(`
            create table order_item_modifiers(
                id SERIAL,
                version int,
                order_id int,
                item_id int,
                modifier_id int,
                modifier_name varchar(255),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (item_id) references items (id),
                foreign key (modifier_id) references modifiers (id),
                foreign key (order_id) references orders (id)
            );
        `);
        await queryRunner.query(`
            create table order_item_modifier_options(
                id SERIAL,
                version int,
                order_id int,
                item_id int,
                modifier_id int,
                modifier_name varchar(255),
                modifier_option_id int,
                modifier_option_name varchar(255),
                quantity int,
                price decimal,
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                deleted_at timestamptz,
                primary key (id),
                foreign key (item_id) references items (id),
                foreign key (modifier_id) references modifiers (id),
                foreign key (modifier_option_id) references modifier_options (id),
                foreign key (order_id) references orders (id)
            );
        `);
        await queryRunner.query(`
            create table order_status(
                id serial,
                order_id int,
                order_version int,
                status order_status_enum,
                primary key (id),
                foreign key (order_id) references orders (id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS order_status`);
        await queryRunner.query(`DROP TABLE IF EXISTS order_item_modifier_options`);
        await queryRunner.query(`DROP TABLE IF EXISTS order_item_modifiers`);
        await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
        await queryRunner.query(`DROP TABLE IF EXISTS order_calculations`);
        await queryRunner.query(`DROP TABLE IF EXISTS orders`);
        await queryRunner.query(`DROP TYPE IF EXISTS order_status_enum`);
        await queryRunner.query('DROP TYPE IF EXISTS order_type');
    }

}
