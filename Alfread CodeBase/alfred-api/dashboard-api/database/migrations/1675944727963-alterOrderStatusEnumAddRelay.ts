import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderStatusEnumAddRelay1675944727963 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_PLACED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_VOID'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_RIDER_AT_PRODUCER'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_PICKUP_PAUSED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_PICKED_UP'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_RIDER_AT_CONSUMER'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_EN_ROUTE_FOR_DELIVERY'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_DELIVERED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_DELIVERY_FAILED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_DELIVERY_RETURNED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_RIDER_ACCEPTED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_RIDER_CANCELLED'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_RIDER_LOCATION'`);
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'RELAY_ORDER_DETAILS_EDITED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
