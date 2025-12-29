import { MigrationInterface, QueryRunner } from "typeorm"

export class addCutlery1675944727967 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hotels ADD COLUMN has_cutlery BOOL
        `);
        await queryRunner.query(`
            ALTER TABLE orders ADD COLUMN number_of_cutleries SMALLINT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
