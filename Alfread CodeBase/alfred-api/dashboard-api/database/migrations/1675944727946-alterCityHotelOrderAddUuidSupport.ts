import { MigrationInterface, QueryRunner } from "typeorm"

export class alterCityHotelOrderAddUuidSupport1675944727946 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`alter table cities add column _id uuid not null default uuid_generate_v4()`);
        await queryRunner.query(`alter table hotels add column _id uuid not null default uuid_generate_v4()`);
        await queryRunner.query(`alter table orders add column _id uuid not null default uuid_generate_v4()`);
        await queryRunner.query(`alter table menus add column _id uuid not null default uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table cities drop column if exists _id`);
        await queryRunner.query(`alter table hotels drop column if exists _id`);
        await queryRunner.query(`alter table orders drop column if exists _id`);
        await queryRunner.query(`alter table menus drop column if exists _id`);
    }
}
