import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./audit.entity";
import { plainToClass } from "class-transformer";

@Entity('voucher_codes')
export class VoucherCode extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'voucher_program_id'
  })
  voucherProgramId: number;

  @Column({
    name: 'amount_used'
  })
  amountUsed: number;

  @Column()
  code: string;

  @Column({
    name: 'claimed_date'
  })
  claimedDate: Date;

  @Column({
    name: 'hotel_web_code'
  })
  hotelWebCode: string;

  @Column({
    name: 'last_name'
  })
  lastName: string;
  
  @Column({
    name: 'room_number'
  })
  roomNumber: string;

  @Column({
    name: 'date_allowed'
  })
  dateAllowed: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(VoucherCode, input, {
      excludeExtraneousValues: true,
    });
  }
}
