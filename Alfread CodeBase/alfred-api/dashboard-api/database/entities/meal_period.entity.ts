import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from './audit.entity';
import { plainToClass } from 'class-transformer';
import { Merchant } from './merchant.entity';

@Entity('meal_period')
export class MealPeriod extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({
    name: 'merchant_id'
  })
  merchantId: number;

  @Column({
    name: 'start_hour'
  })
  startHour: string;

  @Column({
    name: 'end_hour'
  })
  endHour: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.id)
  @JoinColumn({name: 'merchant_id', referencedColumnName: 'id'})
  merchant: Merchant;

  toEntity<T>(input: T | T[]) {
    return plainToClass(MealPeriod, input, {
      excludeExtraneousValues: true,
    });
  }
}
