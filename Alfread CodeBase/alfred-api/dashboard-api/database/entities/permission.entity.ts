import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column()
  method: string;

  @Column()
  description: string;
}
