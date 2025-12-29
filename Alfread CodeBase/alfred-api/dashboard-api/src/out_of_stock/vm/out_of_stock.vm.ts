import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "src/base.vm";

export class OutOfStockVM extends BaseVM {
  @ApiProperty()
  @Expose()
  itemId: number;

  @ApiProperty()
  @Expose()
  availableAfter: Date;

  toVM<T>(input: T | T[]) {
    return plainToClass(OutOfStockVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
