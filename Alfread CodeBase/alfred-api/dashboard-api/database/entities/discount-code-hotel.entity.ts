import { plainToClass } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('discount_code_hotel')
export class DiscountCodeHotel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'discount_code_id'
  })
  discountCodeId: number;

  @Column({
    name: 'hotel_id'
  })
  hotelId: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(DiscountCodeHotel, input, {
      excludeExtraneousValues: true,
    });
  }
}
