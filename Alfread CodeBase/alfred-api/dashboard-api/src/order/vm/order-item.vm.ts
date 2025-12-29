import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "src/base.vm";

export class OrderItemModifierOptionVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  orderId: number;

  @ApiProperty()
  @Expose()
  itemId: number;

  @ApiProperty()
  @Expose()
  modifierId: number;

  @ApiProperty()
  @Expose()
  modifierName: string;

  @ApiProperty()
  @Expose()
  modifierOptionId: number;

  @ApiProperty()
  @Expose()
  modifierOptionName: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  price: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderItemModifierOptionVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrderItemModifierVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  orderId: number;

  @ApiProperty()
  @Expose()
  itemId: number;

  @ApiProperty()
  @Expose()
  modifierId: number;

  @ApiProperty()
  @Expose()
  modifierName: string;

  @ApiProperty({
    type: OrderItemModifierOptionVM,
    isArray: true
  })
  @Expose()
  options: OrderItemModifierOptionVM[];

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderItemModifierVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrderItemVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  orderId: number;

  @ApiProperty()
  @Expose()
  itemId: number;

  @ApiProperty()
  @Expose()
  itemName: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  voucherCode: string;

  @ApiProperty()
  @Expose()
  voucherCodeId: number;

  @ApiProperty({
    type: OrderItemModifierVM,
    isArray: true
  })
  @Expose()
  modifiers: OrderItemModifierVM[]

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}