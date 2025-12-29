import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNumber } from "class-validator";

export class ReplicateMenuConfigurationDTO {
  @ApiProperty({
    description: "Array of target hotel IDs to replicate configuration to",
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: "At least one target hotel ID is required" })
  targetHotelIds: number[];

  @ApiProperty({
    description: "Array of merchant IDs to replicate configuration to",
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: "At least one merchant ID is required" })
  merchantIds: number[];
}
