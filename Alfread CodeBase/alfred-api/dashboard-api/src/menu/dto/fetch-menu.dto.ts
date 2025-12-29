import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class FetchMenuDTO {
  @IsString()
  @ApiProperty({ description: "The scheduled date in string format" })
  scheduledDate: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The scheduled start time in string format",
    required: false,
  })
  scheduledStartTime?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The scheduled end time in string format",
    required: false,
  })
  scheduledEndTime?: string;
}
