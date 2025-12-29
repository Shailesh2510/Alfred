import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableHotelsAddWebCodeConstraint1675944727954 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table hotels add constraint web_code_unique unique(web_code)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table hotels drop constraint web_code_unique
        `);
    }
}
