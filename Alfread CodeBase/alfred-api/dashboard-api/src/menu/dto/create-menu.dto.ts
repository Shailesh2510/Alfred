import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMenuDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber({}, {each: true})
  @IsOptional()
  @ApiProperty({
    isArray: true
  })
  hotelIds?: number[];
}
