import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTableHotelsChangeAddressNumber1675944727956 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hotels ALTER COLUMN address_number TYPE varchar(11)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hotels ALTER COLUMN address_number TYPE smallint
        `);
    }
}
