import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateReferralDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ambassador_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  campaign_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ambassador_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  short_code: string;
}
