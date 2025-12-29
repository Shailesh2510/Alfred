import { MigrationInterface, QueryRunner } from "typeorm";
export class updateVoucherProgramPayerEnum1726637615294
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(
    //   `ALTER TYPE "public"."voucher_program_payer" RENAME TO "voucher_program_payer_old"`
    // );
    // await queryRunner.query(`
    //   CREATE TYPE "public"."voucher_program_payer" AS ENUM('HOTEL', 'ALFRED_RECOVERY', 'ALFRED_PROGRAM')
    // `);
    // await queryRunner.query(`
    //   ALTER TABLE "voucher_programs"
    //   ALTER COLUMN "payer" TYPE "public"."voucher_program_payer"
    //   USING "payer"::text::"public"."voucher_program_payer"
    // `);
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Add 'ALFRED_RECOVERY' if it does not exist
        IF NOT EXISTS (SELECT 1 FROM pg_type AS t
                       JOIN pg_enum AS e ON t.oid = e.enumtypid
                       WHERE t.typname = 'voucher_program_payer'
                       AND e.enumlabel = 'ALFRED_RECOVERY') THEN
          EXECUTE 'ALTER TYPE "voucher_program_payer" ADD VALUE ''ALFRED_RECOVERY''';
        END IF;

        -- Add 'ALFRED_PROGRAM' if it does not exist
        IF NOT EXISTS (SELECT 1 FROM pg_type AS t
                       JOIN pg_enum AS e ON t.oid = e.enumtypid
                       WHERE t.typname = 'voucher_program_payer'
                       AND e.enumlabel = 'ALFRED_PROGRAM') THEN
          EXECUTE 'ALTER TYPE "voucher_program_payer" ADD VALUE ''ALFRED_PROGRAM''';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
