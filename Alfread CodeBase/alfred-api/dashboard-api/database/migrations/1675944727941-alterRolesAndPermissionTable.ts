import { MigrationInterface, QueryRunner } from "typeorm"

export class alterRolesAndPermissionTable1675944727941 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table roles add column description varchar(255)`);
        await queryRunner.query(`alter table permissions add column description varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table roles drop column description`);
        await queryRunner.query(`alter table permissions drop column description`);
    }
}
