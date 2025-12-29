import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { BaseVM } from "../../base.vm";

export class MealPeriodVM extends BaseVM {
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
  merchantId: string;

  @IsString()
  @ApiProperty()
  @Expose()
  merchantName: string;

  @IsString()
  @ApiProperty()
  @Expose()
  startHour: string;

  @IsString()
  @ApiProperty()
  @Expose()
  endHour: string;

  @ApiProperty()
  @Expose()
  timezone: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(MealPeriodVM, input, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true
    });
  }
}