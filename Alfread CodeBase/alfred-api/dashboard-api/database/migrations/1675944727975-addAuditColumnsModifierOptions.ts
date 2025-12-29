import { MigrationInterface, QueryRunner } from "typeorm"

export class addAuditColumnsModifierOptions1675944727975 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table modifier_options add column created_at timestamptz default CURRENT_TIMESTAMP(6);
        `);
        await queryRunner.query(`
            alter table modifier_options add column updated_at timestamptz default CURRENT_TIMESTAMP(6);
        `);
        await queryRunner.query(`
            alter table modifier_options add column deleted_at timestamptz;
        `);
        await queryRunner.query(`
            alter table modifier_options add column version int;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
