import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class APICreateOutOfStockDTO {
  @ApiProperty()
  @IsNumber()
  itemId: number;

  @ApiProperty()
  @IsString()
  out: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  availableAfter?: Date;
}

export class CreateOutOfStockDTO extends APICreateOutOfStockDTO {
  @ApiProperty()
  @IsNumber()
  merchantId: number;
}
