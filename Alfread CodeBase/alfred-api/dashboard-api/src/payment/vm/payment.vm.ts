import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "src/base.vm";

export class InitPaymentVM extends BaseVM {
  @ApiProperty()
  @Expose({name: 'client_secret'})
  clientSecret: string;

  @ApiProperty()
  @Expose({name: 'next_action'})
  nextAction: string;

  @ApiProperty()
  @Expose({name: 'status'})
  status: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(InitPaymentVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
