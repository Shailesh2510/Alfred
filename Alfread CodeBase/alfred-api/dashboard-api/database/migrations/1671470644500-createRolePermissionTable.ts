import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRolePermissionTable1671470644500
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE role_permission(
        id SERIAL PRIMARY KEY,
        role_id INT,
        permission_id INT,
        foreign key (role_id) references roles(id),
        foreign key (permission_id) references permissions(id),
        CONSTRAINT cstx_unique_role_permission UNIQUE (role_id, permission_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP TABLE IF EXISTS role_permission');
  }
}
