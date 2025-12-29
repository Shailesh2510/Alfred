import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class APIUpdateOrderPositionDTO {
  @IsNumber()
  @ApiProperty()
  menuItemId: number;

  @IsNumber()
  @ApiProperty()
  menuCategoryId: number;

  @IsNumber()
  @ApiProperty()
  orderPosition: number;
}
