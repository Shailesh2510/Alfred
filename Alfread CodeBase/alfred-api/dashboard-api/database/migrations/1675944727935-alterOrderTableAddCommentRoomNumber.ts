import { MigrationInterface, QueryRunner } from "typeorm"

export class alterOrderTableAddCommentRoomNumber1675944727935 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders add column comment text`);
        await queryRunner.query(`alter table orders add column room_number varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table orders drop column if exists comment`);
        await queryRunner.query(`alter table orders drop column if exists room_number`);
    }
}
