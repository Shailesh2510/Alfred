import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { BaseVM } from "src/base.vm";
import { ModifierVM } from "../../modifier/vm/modifier.vm";

export class MenuVM extends BaseVM {
  @ApiProperty()
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  version: number;

  @ApiProperty()
  @Expose()
  @IsString()
  name: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(MenuVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedMenuVM extends BaseVM {
  @ApiProperty()
  @Expose({ name: "image_url" })
  imageUrl: string;

  @ApiProperty()
  @Expose({ name: "description" })
  description: string;

  @ApiProperty()
  @Expose({ name: "menu_item_id" })
  menuItemId: number;

  @ApiProperty()
  @Expose({ name: "menu_category_id" })
  menuCategoryId: number;

  @ApiProperty()
  @Expose({ name: "menu_category_name" })
  menuCategoryName: string;

  @ApiProperty()
  @Expose({ name: "item_order_quantity" })
  itemOrderQuantity: string;

  @ApiProperty()
  @Expose({ name: "menu_category_position" })
  menuCategoryPosition: number;

  @ApiProperty()
  @Expose({ name: "meal_period_id" })
  mealPeriodId: number;

  @ApiProperty()
  @Expose({ name: "meal_period_name" })
  mealPeriodName: string;

  @ApiProperty()
  @Expose({ name: "meal_period_start_hour" })
  mealPeriodStartHour: string;

  @ApiProperty()
  @Expose({ name: "meal_period_end_hour" })
  mealPeriodEndHour: string;

  @ApiProperty()
  @Expose({ name: "merchant_id" })
  merchantId: number;

  @ApiProperty()
  @Expose({ name: "merchant_name" })
  merchantName: string;

  @ApiProperty()
  @Expose({ name: "item_id" })
  itemId: number;

  @ApiProperty()
  @Expose({ name: "item_name" })
  itemName: string;

  @ApiProperty()
  @Expose({ name: "order_position" })
  orderPosition: number;

  @ApiProperty()
  @Expose({ name: "tax_rate" })
  taxRate: number;

  @ApiProperty()
  @Expose({ name: "merchant_is_active" })
  merchantIsActive: number;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose({ name: "new_price" })
  newPrice: number;

  @ApiProperty()
  @Expose()
  tags: number;

  @ApiProperty({
    isArray: true,
    type: ModifierVM,
  })
  @Expose()
  modifiers: ModifierVM[];

  toVM<T>(input: T | T[]) {
    const data = plainToClass(DetailedMenuVM, input, {
      excludeExtraneousValues: true,
    });
    if (data.modifiers) {
      data.modifiers = data.modifiers.map((e: ModifierVM) =>
        new ModifierVM(e).build()
      );
    }
    return data;
  }
}
