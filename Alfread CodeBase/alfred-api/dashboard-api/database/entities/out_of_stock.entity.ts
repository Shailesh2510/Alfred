import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('out_of_stock')
export class OutOfStock {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({name: 'merchant_id'})
  merchantId: number;

  @Column({name: 'item_id'})
  itemId: number;

  @Column({name: 'available_after'})
  availableAfter: Date;
}
