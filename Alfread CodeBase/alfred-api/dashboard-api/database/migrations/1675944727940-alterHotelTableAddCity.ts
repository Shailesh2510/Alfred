import { MigrationInterface, QueryRunner } from "typeorm"

export class alterHotelTableAddCity1675944727940 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table hotels add column city_id int`);
        await queryRunner.query(`alter table hotels add foreign key (city_id) references cities (id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table hotels drop constraint hotels_city_id_fkey`);
        await queryRunner.query(`alter table hotels drop column if exists city_id`);
    }
}
