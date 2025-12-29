import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class APIRefundDTO {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  orderId: number;
}
