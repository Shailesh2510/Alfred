import { MigrationInterface, QueryRunner } from "typeorm"

export class createPaymentLogsTable1675944727945 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create table payment_logs(
                id serial,
                payment_intent_id varchar(255),
                payment_provider varchar(255),
                order_id int,
                event_type varchar(255),
                status varchar(255),
                refund_id varchar(255),
                created_at timestamptz default CURRENT_TIMESTAMP(6),
                updated_at timestamptz default CURRENT_TIMESTAMP(6),
                foreign key (order_id) references orders (id)
            )
        `);
        await queryRunner.query(`
            alter table orders add column payment_status varchar(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column if exists payment_status`);
        await queryRunner.query(`drop table if exists payment_logs`);
    }
}
