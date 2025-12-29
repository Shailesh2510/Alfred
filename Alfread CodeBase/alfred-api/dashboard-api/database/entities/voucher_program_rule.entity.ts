import { DECIMAL_COLUMN } from "helpers";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('voucher_program_rules')
export class VoucherProgramRule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  version: number;
  
  @Column({
    name: 'voucher_program_id'
  })
  voucherProgramId: number;
  
  @Column({
    name: 'meal_period_id'
  })
  mealPeriodId: number;
  
  @Column({
    type: 'jsonb',
    name: 'menu_category_ids'
  })
  menuCategoryIds: number[]
  
  @Column()
  quantity: number;
  
  @Column(DECIMAL_COLUMN, {
    name: 'max_price'
  })
  maxPrice:number
}
