import { DECIMAL_COLUMN } from 'helpers';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from './audit.entity';
import { plainToClass } from 'class-transformer';

@Entity('modifier_options')
export class ModifierOption extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({
    name: 'merchant_id',
  })
  merchantId: number;

  @Column({
    name: 'modifier_id',
  })
  modifierId: number;

  @Column(DECIMAL_COLUMN)
  price: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(ModifierOption, input, {
      excludeExtraneousValues: true,
    });
  }
}
