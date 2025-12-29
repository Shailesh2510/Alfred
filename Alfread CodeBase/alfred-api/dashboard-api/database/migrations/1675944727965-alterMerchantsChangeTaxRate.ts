import { MigrationInterface, QueryRunner } from "typeorm"

export class alterMerchantsChangeTaxRate1675944727965 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE merchants
            ALTER COLUMN tax_rate SET DATA TYPE numeric(10,5) 
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
