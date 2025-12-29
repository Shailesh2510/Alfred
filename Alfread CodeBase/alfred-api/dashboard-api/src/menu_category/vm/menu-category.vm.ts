import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { BaseVM } from "src/base.vm";

export class MenuCategoryVM extends BaseVM {
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

  @ApiProperty()
  @Expose({name: 'meal_period_id'})
  mealPeriodId: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  orderPosition: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(MenuCategoryVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
