import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedCities1675944727933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('cities')
      .values([
        {
          version: 1,
          name: 'New York City Test',
          state: 'New York',
          zipCode: '10001',
          timezone: 'America/New_York',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          version: 1,
          name: 'Los Angeles Test',
          state: 'California',
          zipCode: '90001',
          timezone: 'America/Los_Angeles',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM cities where name in (\'New York City\', \'Los Angeles\')');
  }
}
