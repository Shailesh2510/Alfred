import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('voucher_program_hotel')
export class VoucherProgramHotel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'voucher_program_id'
  })
  voucherProgramId: number;

  @Column({
    name: 'hotel_id'
  })
  hotelId: number;
}