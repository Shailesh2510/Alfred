import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseVM } from "../../base.vm";

export class CategoryVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  @Expose()
  mealPeriodId?: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(CategoryVM, input, {
      excludeExtraneousValues: true,
    });
  }
}