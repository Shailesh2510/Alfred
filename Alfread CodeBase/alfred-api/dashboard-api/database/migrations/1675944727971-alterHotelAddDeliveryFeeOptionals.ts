import { MigrationInterface, QueryRunner } from "typeorm"

export class alterHotelAddDeliveryFeeOptionals1675944727971 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hotels ADD COLUMN has_third_party_delivery boolean
        `);
        await queryRunner.query(`
            ALTER TABLE hotels ADD COLUMN has_delivery_fee boolean
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
