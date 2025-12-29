import { MigrationInterface, QueryRunner } from "typeorm"

export class addTableRelayTracking1675944727957 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE order_status ADD column relay_response jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE order_status DROP column relay_response
        `);
    }
}
