import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterGuestTableAddRoomNumberAndHotelWebCode1740421557002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE guests ADD COLUMN room_number VARCHAR(255);`);
        await queryRunner.query(`ALTER TABLE guests ADD COLUMN hotel_web_code VARCHAR(255);`);
        await queryRunner.query(`ALTER TABLE guests ADD CONSTRAINT phone_number_key UNIQUE (phone_number)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE guests DROP COLUMN room_number;`);
        await queryRunner.query(`ALTER TABLE guests DROP COLUMN hotel_web_code;`);
        await queryRunner.query(`ALTER TABLE the_table DROP CONSTRAINT IF EXISTS phone_number_key;`);
    }

}
