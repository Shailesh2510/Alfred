import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMerchantColorColumn1729683964258 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merchants",
            new TableColumn({
                name: "color",
                type: "varchar",
                length: "7",
                isNullable: false,
                default: "'#000000'"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("merchants", "color");
    }
}