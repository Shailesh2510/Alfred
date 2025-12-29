import { plainToClass } from 'class-transformer';
import { DECIMAL_COLUMN } from 'helpers';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum DiscountCodeType {
  GENERAL_REGULAR = 'REGULAR', //multi-use
  SINGLE_USER = 'SINGLE_USER' //single-use
}

export enum DiscountCodeAccessType {
  ADMIN = 'ADMIN',
  HOTEL = 'HOTEL'
}

export enum AmountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  code: string;

  @Column({
    enum: DiscountCodeType
  })
  type: DiscountCodeType;

  @Column({
    enum: DiscountCodeAccessType,
    name: 'access_type'
  })
  accessType: DiscountCodeAccessType;

  @Column({
    enum: AmountType,
    name: 'amount_type'
  })
  amountType: AmountType;

  @Column(DECIMAL_COLUMN, {
    name: 'total_amount'
  })
  totalAmount: number;

  @Column()
  description: string;

  @Column({
    name: 'is_active'
  })
  isActive: boolean;

  toEntity<T>(input: T | T[]) {
    return plainToClass(DiscountCode, input, {
      excludeExtraneousValues: true,
    });
  }
}
