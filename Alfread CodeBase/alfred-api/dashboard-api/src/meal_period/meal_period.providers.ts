import { MEAL_PERIOD_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { MealPeriod } from '../../database/entities/meal_period.entity';

export const mealPeriodProviders = [
  {
    provide: MEAL_PERIOD_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MealPeriod),
    inject: [PG_DATA_SOURCE],
  },
];
