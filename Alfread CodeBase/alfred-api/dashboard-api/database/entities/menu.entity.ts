import { plainToClass } from 'class-transformer';
import { AuditEntity } from './audit.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menus')
export class Menu extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: '_id'
  })
  _id: string;

  @Column()
  name: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Menu, input, {
      excludeExtraneousValues: true,
    });
  }
}
