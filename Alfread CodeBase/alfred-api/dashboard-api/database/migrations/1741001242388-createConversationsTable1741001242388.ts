import { MigrationInterface, QueryRunner } from "typeorm";

export class createConversationsTable1741001242388
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE conversations (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        session_id VARCHAR(255) NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        message TEXT NOT NULL,
        role user_type NOT NULL, -- Using existing user_type ENUM
        vote BOOLEAN NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMPTZ NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS conversations");
  }
}
