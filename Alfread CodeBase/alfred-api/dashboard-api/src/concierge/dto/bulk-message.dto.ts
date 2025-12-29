import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class bulkMessageDTO {
  @IsNumber()
  @ApiProperty()
  daysBeforeCheckin: number;

  @IsString()
  @ApiProperty()
  message: string;
}