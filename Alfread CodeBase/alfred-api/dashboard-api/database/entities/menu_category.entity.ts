import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("menu_category")
export class MenuCategory {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "menu_id",
  })
  menuId: number;

  @Column({
    name: "meal_period_id",
  })
  mealPeriodId: number;

  @Column()
  name: string;

  @Column({
    name: "order_position",
  })
  orderPosition: number;
}
