import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class APIUpdateMerchantOrderPositionDTO {
  @ApiProperty()
  @IsNumber()
  merchantId: number;

  @ApiProperty()
  @IsNumber()
  orderPosition: number;
}
