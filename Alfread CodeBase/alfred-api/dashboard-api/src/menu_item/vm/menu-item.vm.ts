import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { BaseVM } from "src/base.vm";

export class MenuItemVM extends BaseVM {
  @ApiProperty()
  @Expose()
  @IsNumber()
  id: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  itemId: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  menuId: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  menuCategoryId: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  price: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  newPrice: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  orderPosition: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(MenuItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
