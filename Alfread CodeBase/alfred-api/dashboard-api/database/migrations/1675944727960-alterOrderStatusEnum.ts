import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderStatusEnum1675944727960 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE order_status_enum ADD VALUE 'INITIATED' BEFORE 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
