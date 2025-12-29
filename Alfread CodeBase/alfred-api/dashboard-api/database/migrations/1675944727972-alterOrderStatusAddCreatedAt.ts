import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderStatusAddCreatedAt1675944727972 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE order_status ADD COLUMN created_at timestamptz default CURRENT_TIMESTAMP(6)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
