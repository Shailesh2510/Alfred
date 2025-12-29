import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedMealPeriod1675944727935 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const merchantIds = await queryRunner.manager.query(
      `select id from merchants where name = 'Merchant 1' order by id limit 1`
    );
    const getMerchantId = () => {
      return merchantIds[0].id
    }

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('meal_period')
      .values([
        {
          version: 1,
          name: 'Breakfast',
          merchantId: getMerchantId(),
          startHour: '06:00:00',
          endHour: '10:00:00',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          version: 1,
          name: 'Brunch',
          merchantId: getMerchantId(),
          startHour: '10:00:00',
          endHour: '12:00:00',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          version: 1,
          name: 'Lunch',
          merchantId: getMerchantId(),
          startHour: '12:00:00',
          endHour: '14:00:00',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          version: 1,
          name: 'Dinner',
          merchantId: getMerchantId(),
          startHour: '17:00:00',
          endHour: '21:00:00',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM meal_period where name in (\'Breakfast\', \'Brunch\', \'Lunch\', \'Dinner\')');
  }
}
