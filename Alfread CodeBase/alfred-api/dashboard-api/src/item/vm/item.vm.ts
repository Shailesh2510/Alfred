import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type, plainToClass } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseVM } from "../../base.vm";
import { ModifierOptionVM, ModifierVM } from "../../modifier/vm/modifier.vm";

class ItemCategoryVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version: number;
}

class ItemModifierVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version: number;

  @IsString()
  @ApiProperty()
  @Expose()
  price: string;

  @ApiProperty({
    type: ModifierOptionVM,
    isArray: true,
  })
  @Type(() => ModifierOptionVM)
  @IsOptional()
  @Expose()
  options?: ModifierOptionVM[];
}

export class SimpleListItemVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsString()
  @ApiProperty()
  @Expose()
  price: string;

  @IsString()
  @ApiProperty()
  @Expose()
  tags: string;

  @IsString()
  @ApiProperty()
  @Expose()
  description: string;

  @IsString()
  @ApiProperty()
  @Expose({ name: "promo_price" })
  promoPrice: string;

  @IsString()
  @ApiProperty()
  @Expose({ name: "image_url" })
  imageUrl: string;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "out_of_stock_id" })
  outOfStockId: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "order_quantity" })
  orderQuantity: number;

  @ApiProperty()
  @Expose()
  modifiers: any[];

  toVM<T>(input: T | T[]) {
    return plainToClass(SimpleListItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class MealPeriodItemVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version: number;
}

export class ItemVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({
    isArray: true,
    type: MealPeriodItemVM,
  })
  @Expose({ name: "meal_periods" })
  mealPeriods: MealPeriodItemVM[];

  @ApiProperty()
  @Expose()
  categories: ItemCategoryVM[];

  @ApiProperty({
    isArray: true,
    type: ModifierVM,
  })
  @Expose()
  modifiers: ModifierVM[];

  @IsString()
  @ApiProperty()
  @Expose()
  price: string;

  @IsString()
  @ApiProperty()
  @Expose({
    name: "image_url",
  })
  imageUrl: string;

  @IsString()
  @ApiProperty()
  @Expose()
  tags: string;

  @IsString()
  @ApiProperty()
  @Expose()
  description: string;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "order_quantity" })
  orderQuantity: number;

  @IsString()
  @ApiProperty()
  @Expose({ name: "promo_price" })
  promoPrice: string;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "out_of_stock_id" })
  outOfStockId: number;

  @IsDateString()
  @ApiProperty()
  @Expose({ name: "out_of_stock_available_after" })
  outOfStockAvailableAfter: Date;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "order_position" })
  orderPosition: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "new_price" })
  newPrice: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "menu_category_id" })
  menuCategoryId: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(ItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedItemVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  mealPeriodId: number;

  @ApiProperty()
  @Expose()
  mealPeriodName: string;

  @ApiProperty()
  @Expose()
  categories: ItemCategoryVM[];

  @ApiProperty({
    isArray: true,
    type: ModifierVM,
  })
  @Expose()
  modifiers: ModifierVM[];

  @IsString()
  @ApiProperty()
  @Expose()
  price: string;

  @IsString()
  @ApiProperty()
  @Expose()
  tags: string;

  @IsString()
  @ApiProperty()
  @Expose()
  description: string;

  @IsString()
  @ApiProperty()
  @Expose()
  promoPrice: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(ItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class CategorizedItemVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  mealPeriodId: number;

  @IsString()
  @ApiProperty()
  @Expose()
  mealPeriodName: string;

  @IsString()
  @ApiProperty()
  @Expose()
  mealPeriodStartHour: string;

  @IsString()
  @ApiProperty()
  @Expose()
  mealPeriodEndHour: string;

  @ApiProperty({
    isArray: true,
    type: ItemVM,
  })
  @Expose()
  items: ItemVM[];

  toVM<T>(input: T | T[]) {
    return plainToClass(CategorizedItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
