import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateMenuItemDTO {
  @IsNumber()
  @ApiProperty()
  itemId: number;

  @IsNumber()
  @ApiProperty()
  menuId: number;

  @IsNumber()
  @ApiProperty()
  menuCategoryId: number;

  @IsNumber()
  @ApiProperty()
  newPrice: number;
}

export class BatchCreateMenuItemDTO {
  @ApiProperty({
    isArray: true,
    type: Number
  })
  @IsNumber({}, {each: true})
  itemIds: number[];

  @IsNumber()
  @ApiProperty()
  menuId: number;

  @IsNumber()
  @ApiProperty()
  menuCategoryId: number;
}
