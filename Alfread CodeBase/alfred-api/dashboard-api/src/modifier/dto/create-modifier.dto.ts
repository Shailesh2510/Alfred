import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateModifierOptionDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  price: string;
}

export class CreateModifierDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({
    isArray: true,
    type: CreateModifierOptionDTO
  })
  @Type(() => CreateModifierOptionDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  options?: CreateModifierOptionDTO[];

  @IsBoolean()
  @ApiProperty()
  requiredOptions: boolean;

  @IsBoolean()
  @ApiProperty()
  multipleOptions: boolean;

  @IsNumber()
  @ApiProperty()
  freeModifierCount: number;
}
