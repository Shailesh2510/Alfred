import { IsNotEmpty, IsString, IsEnum, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MerchantType } from "database/enums/merchantType";
export class UpdateCampaignDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}
