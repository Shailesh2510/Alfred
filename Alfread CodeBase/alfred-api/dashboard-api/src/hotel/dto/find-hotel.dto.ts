import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FindHotelByHotelNameDTO {
  @ApiProperty()
  @IsString()
  hotelName: string;
}
