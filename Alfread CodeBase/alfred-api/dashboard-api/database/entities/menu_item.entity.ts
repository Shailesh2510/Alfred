import { DECIMAL_COLUMN } from 'helpers';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu_item')
export class MenuItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'item_id',
  })
  itemId: number;

  @Column({
    name: 'menu_id',
  })
  menuId: number;

  @Column({
    name: 'menu_category_id',
  })
  menuCategoryId: number;

  @Column(DECIMAL_COLUMN, {
    name: 'price',
  })
  price: number;

  @Column(DECIMAL_COLUMN, {
    name: 'new_price',
  })
  newPrice: number;

  @Column({
    name: 'order_position'
  })
  orderPosition: number;

  @Column({
    name: 'merchant_id'
  })
  merchantId: number;
}
