import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "src/base.vm";

export class DiscountCodeVM extends BaseVM {
  @ApiProperty()
  @Expose()
  code: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(DiscountCodeVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
