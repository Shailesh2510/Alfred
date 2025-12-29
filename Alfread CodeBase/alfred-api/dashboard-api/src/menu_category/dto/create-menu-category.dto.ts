import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateMenuCategoryDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  mealPeriodId: number;

  @IsNumber()
  @ApiProperty()
  menuId: number;
}
