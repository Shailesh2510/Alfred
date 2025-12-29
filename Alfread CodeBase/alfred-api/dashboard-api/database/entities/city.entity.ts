import { plainToClass } from 'class-transformer';
import { AuditEntity } from './audit.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cities')
export class City extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: '_id'
  })
  _id: string;

  @Column()
  name: string;

  @Column()
  state: string;

  @Column({
    name: 'zip_code',
  })
  zipCode: string;

  @Column()
  timezone: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(City, input, {
      excludeExtraneousValues: true,
    });
  }
}
