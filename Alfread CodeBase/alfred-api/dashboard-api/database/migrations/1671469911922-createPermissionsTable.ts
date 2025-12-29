import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPermissionsTable1671469911922 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE permissions (
        id INT PRIMARY KEY,
        name varchar(200),
        method varchar(100),
        path varchar(200),
        CONSTRAINT cstx_unique_method_path UNIQUE (method, path)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE IF EXISTS permissions`);
  }
}
