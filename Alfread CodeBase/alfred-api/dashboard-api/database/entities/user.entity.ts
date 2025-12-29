import { UserType } from '../enums/usertype';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, plainToClass } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from './audit.entity';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  type: UserType;
  isActive: boolean;
}

@Entity('users')
export class User extends AuditEntity implements IUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'first_name',
  })
  firstName: string;

  @Column({
    name: 'last_name',
  })
  lastName: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({
    name: 'phone_number'
  })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  type: UserType;

  @Column({
    name: 'is_active',
  })
  isActive: boolean;

  toEntity<T>(input: T | T[]) {
    return plainToClass(User, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity('user_role')
export class UserRole {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'role_id',
  })
  roleId: number;
}

@Entity('user_merchant')
export class UserMerchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'merchant_id',
  })
  merchantId: number;
}

@Entity('user_hotel')
export class UserHotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'hotel_id',
  })
  hotelId: number;
}

export interface IInjectableUser extends IUser {
  hotelId?: number;
  merchantId?: number;
}
export class InjectableUser extends User implements IInjectableUser {
  hotelId?: number;
  merchantId?: number;
}

export class InjectableUserVM extends AuditEntity implements IInjectableUser {
  @IsNumber()
  @ApiProperty()
  @Expose({name: 'hotel_id'})
  hotelId?: number;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'merchant_id'})
  merchantId?: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose({name: 'first_name'})
  firstName: string;

  @IsString()
  @ApiProperty()
  @Expose({name: 'last_name'})
  lastName: string;

  @IsString()
  @ApiProperty()
  @Expose()
  username: string;

  @IsString()
  @ApiProperty()
  @Expose({name: 'phone_number'})
  phoneNumber: string;

  @IsString()
  @ApiProperty()
  @Expose()
  email: string;

  @IsString()
  @ApiProperty()
  @Expose()
  type: UserType;

  @IsBoolean()
  @ApiProperty()
  @Expose({name: 'is_active'})
  isActive: boolean;

  static toVM<T>(input: T | T[]) {
    return plainToClass(InjectableUserVM, input, {
      excludeExtraneousValues: true,
    });
  }

  toEntity<T>(input: T | T[]) {
    return plainToClass(InjectableUserVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
