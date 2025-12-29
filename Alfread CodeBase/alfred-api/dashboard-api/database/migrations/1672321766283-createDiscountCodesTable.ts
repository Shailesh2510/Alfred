import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDiscountCodesTable1672321766283
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table discount_codes (
        id serial,
        code varchar(100),
        primary key (id)
      );
    `);
    await queryRunner.query(`
      create table merchant_discount_code (
        id serial,
        merchant_id int,
        discount_code_id int,
        primary key (id),
        foreign key (merchant_id) references merchants (id),
        foreign key (discount_code_id) references discount_codes (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists merchant_discount_code`);
    await queryRunner.query(`drop table if exists discount_codes`);
  }
}
