import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedCategories1675944727936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const breakfastMealPeriodId = await queryRunner.manager.query(
      `select id from meal_period where name = 'Breakfast'`
    );
    const brunchMealPeriodId = await queryRunner.manager.query(
      `select id from meal_period where name = 'Brunch'`
    );
    const lunchMealPeriodId = await queryRunner.manager.query(
      `select id from meal_period where name = 'Lunch'`
    );
    const dinnerMealPeriodId = await queryRunner.manager.query(
      `select id from meal_period where name = 'Dinner'`
    );

    const merchantIds = await queryRunner.manager.query(
      `select id from merchants where name = 'Merchant 1' order by id limit 1`
    );
    const getMerchantId = () => {
      return merchantIds[0].id
    }


    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('categories')
      .values([
        {
          version: 1,
          merchantId: getMerchantId(),
          mealPeriodId: breakfastMealPeriodId[0].id,
          name: 'Uncategorized',
        },
        {
          version: 1,
          merchantId: getMerchantId(),
          mealPeriodId: brunchMealPeriodId[0].id,
          name: 'Uncategorized',
        },
        {
          version: 1,
          merchantId: getMerchantId(),
          mealPeriodId: lunchMealPeriodId[0].id,
          name: 'Uncategorized',
        },
        {
          version: 1,
          merchantId: getMerchantId(),
          mealPeriodId: dinnerMealPeriodId[0].id,
          name: 'Uncategorized',
        },
      ]).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
      DELETE FROM categories where name in (\'Category 1\', \'Category 2\', \'Category 3\', \'Category 4\', \'Category 5\', \'Category 6\', \'Category 7\', \'Category 8\', \'Category 9\', \'Category 10\', \'Category 11\', \'Category 12\')
    `);
  }
}
