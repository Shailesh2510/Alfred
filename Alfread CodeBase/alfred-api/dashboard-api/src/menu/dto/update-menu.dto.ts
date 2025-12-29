import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateMenuDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber({}, {each: true})
  @IsOptional()
  @ApiProperty()
  hotelIds?: number[];
}
