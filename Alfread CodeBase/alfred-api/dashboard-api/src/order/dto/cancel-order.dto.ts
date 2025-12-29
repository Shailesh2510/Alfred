import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CancelOrderDTO {
  @IsNumber()
  @ApiProperty()
  version: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  reason?: string;

  @IsString()
  @ApiProperty()
  option: string;
}
