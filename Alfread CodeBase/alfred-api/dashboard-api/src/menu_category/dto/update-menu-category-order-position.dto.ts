import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class APIUpdateMenuCategoryOrderPositionDTO {
  @ApiProperty()
  @IsNumber()
  menuCategoryId: number;

  @ApiProperty()
  @IsNumber()
  orderPosition: number;
}
