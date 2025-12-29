import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu_hotel')
export class MenuHotel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'hotel_id',
  })
  hotelId: number;

  @Column({
    name: 'menu_id',
  })
  menuId: number;
}
