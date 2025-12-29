import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHotelArrivalsTable1743780821229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE hotel_arrivals (
                id INT PRIMARY KEY AUTO_INCREMENT,
                room_number VARCHAR(10),
                reservation_status VARCHAR(50),
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                arrival_date DATE,
                departure_date DATE,
                special_requests VARCHAR(1000),
                phone_number VARCHAR(20),
                email VARCHAR(100),
                comments VARCHAR(1000),
                country_code VARCHAR(10),
                membership_id VARCHAR(50),
                membership_level VARCHAR(50),
                membership_type VARCHAR(50),
                hotel_id INT,
                phone_number_canonical VARCHAR(20)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE IF EXISTS hotel_arrivals");
    }

}
