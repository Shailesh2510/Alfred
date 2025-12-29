import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('order_discount_code_logs')
export class OrderDiscountCodeLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'order_id'
  })
  orderId: number;

  @Column({
    name: 'discount_code_id'
  })
  discountCodeId: number;

  @Column({
    name: 'discount_code'
  })
  discountCode: string;

  @Column({
    name: 'client_number'
  })
  clientNumber: string;

  @Column({
    name: 'client_email'
  })
  clientEmail: string;
}
