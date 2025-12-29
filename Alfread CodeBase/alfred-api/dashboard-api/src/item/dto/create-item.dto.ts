import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class APICreateItemDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsNumber({}, { each: true })
  mealPeriodIds: number[];

  @ApiProperty()
  @IsNumber({}, { each: true })
  @IsOptional()
  modifierIds?: number[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  promoPrice?: number;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsNumber()
  orderQuantity: number;
}

export class APIAssignItemsToMealPeriodDTO {
  @ApiProperty()
  @IsNumber()
  mealPeriodId: number;

  @ApiProperty({
    isArray: true,
    type: Number,
  })
  @IsNumber({}, { each: true })
  itemIds: number[];
}

export class CreateItemDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @ApiProperty()
  @IsNumber({}, { each: true })
  modifierIds: number[];

  @ApiProperty()
  @IsString()
  tags: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  price: number;

  @ApiProperty()
  @IsString()
  promoPrice: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsNumber()
  orderQuantity: number;
}
