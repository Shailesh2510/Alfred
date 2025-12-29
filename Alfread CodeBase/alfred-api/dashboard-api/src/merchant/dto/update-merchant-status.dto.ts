import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateMerchantStatusDTO {
  @IsBoolean()
  @ApiProperty()
  isActive: boolean;
}
