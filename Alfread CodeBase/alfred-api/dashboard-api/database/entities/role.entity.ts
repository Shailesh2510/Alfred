import { RoleType } from '../../database/enums/roletype';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from './audit.entity';
import { plainToClass } from 'class-transformer';

@Entity('roles')
export class Role extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  type: string;

  @Column()
  name: string;

  @Column()
  description: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Role, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity('role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
  })
  roleId: number;

  @Column({
    name: 'permission_id',
  })
  permissionId: number;
}

@Entity('role_merchant')
export class RoleMerchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
  })
  roleId: number;

  @Column({
    name: 'merchant_id',
  })
  merchantId: number;
}

@Entity('role_hotel')
export class RoleHotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
  })
  roleId: number;

  @Column({
    name: 'hotel_id',
  })
  hotelId: number;
}
