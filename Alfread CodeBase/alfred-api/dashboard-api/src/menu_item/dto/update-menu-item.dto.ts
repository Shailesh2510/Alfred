import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class UpdateMenuItemDTO {
  @IsNumber()
  @ApiProperty()
  newPrice: number;
}
