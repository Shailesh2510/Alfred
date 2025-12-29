import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PresignUrlDTO {
  @IsString()
  @ApiProperty()
  contentType: string;
}
