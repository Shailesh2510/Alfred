import { plainToClass } from 'class-transformer';
import { AuditEntity } from './audit.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({
    name: 'merchant_id',
  })
  merchantId: number;

  @Column({
    name: 'meal_period_id',
  })
  mealPeriodId: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Category, input, {
      excludeExtraneousValues: true,
    });
  }
}
