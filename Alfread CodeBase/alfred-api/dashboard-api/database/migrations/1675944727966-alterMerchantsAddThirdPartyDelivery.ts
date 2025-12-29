import { MigrationInterface, QueryRunner } from "typeorm"

export class alterMerchantsAddThirdPartyDelivery1675944727966 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE merchants
            ADD COLUMN has_third_party_delivery BOOL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
