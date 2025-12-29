import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRoleAssociationTable1672944387752
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table role_hotel (
            id serial primary key,
            role_id int,
            hotel_id int,
            foreign key (role_id) references roles(id),
            foreign key (hotel_id) references hotels(id)
        );
    `);
    await queryRunner.query(`
        create table role_merchant (
            id serial primary key,
            role_id int,
            merchant_id int,
            foreign key (role_id) references roles(id),
            foreign key (merchant_id) references merchants(id)
        );
    `);
    await queryRunner.query(`
        create table user_merchant (
            id serial primary key,
            user_id int,
            merchant_id int,
            foreign key (user_id) references users(id),
            foreign key (merchant_id) references merchants(id)
        );
    `);
    await queryRunner.query(`
        create table user_hotel (
            id serial primary key,
            user_id int,
            hotel_id int,
            foreign key (user_id) references users(id),
            foreign key (hotel_id) references hotels(id)
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists user_hotel`);
    await queryRunner.query(`drop table if exists user_merchant`);
    await queryRunner.query(`drop table if exists role_merchant`);
    await queryRunner.query(`drop table if exists role_hotel`);
  }
}
