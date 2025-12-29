import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DiscountCodeClientFilters {
  @IsString()
  @ApiProperty()
  clientEmail: string;

  @IsString()
  @ApiProperty()
  clientNumber: string;
}
