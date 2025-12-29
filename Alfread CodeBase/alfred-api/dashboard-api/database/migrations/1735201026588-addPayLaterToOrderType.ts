import { MigrationInterface, QueryRunner } from "typeorm";

export class addPayLaterToOrderType1735201026588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "order_type" ADD VALUE 'PAY_LATER';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "order_type_new" AS ENUM ('EXISTING_VALUE_1', 'EXISTING_VALUE_2'); 
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "order_type" TYPE "order_type_new"
      USING "order_type"::text::"order_type_new";
    `);

    await queryRunner.query(`
      DROP TYPE "order_type";
    `);

    await queryRunner.query(`
      ALTER TYPE "order_type_new" RENAME TO "order_type";
    `);
  }
}
