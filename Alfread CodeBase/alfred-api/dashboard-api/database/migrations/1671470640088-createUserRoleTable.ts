import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUserRoleTable1671470640088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE user_role (
        id SERIAL PRIMARY KEY,
        user_id INT,
        role_id INT,
        foreign key (user_id) references users(id),
        foreign key (role_id) references roles(id),
        CONSTRAINT cstx_unique_user_role UNIQUE (user_id, role_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE IF EXISTS user_role`);
  }
}
