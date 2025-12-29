import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CancelOrderByIdDTO {
  @IsString()
  @ApiProperty()
  @IsOptional()
  reason?: string;

  @IsString()
  @ApiProperty()
  option: string;
}
