import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderTableAddTipAndDeliveryFee1675944727937 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column tip numeric(10,5)`);
        await queryRunner.query(`alter table orders add column delivery_fee numeric(10,5)`);

        await queryRunner.query(`alter table order_calculations add column tip numeric(10,5)`);
        await queryRunner.query(`alter table order_calculations add column delivery_fee numeric(10,5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column tip`);
        await queryRunner.query(`alter table orders drop column delivery_fee`);

        await queryRunner.query(`alter table order_calculations drop column tip`);
        await queryRunner.query(`alter table order_calculations drop column delivery_fee`);
    }
}
