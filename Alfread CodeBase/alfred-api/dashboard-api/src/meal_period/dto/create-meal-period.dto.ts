import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateMealPeriodDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  merchantId: number;

  @IsString()
  @ApiProperty()
  startHour: string;

  @IsString()
  @ApiProperty()
  endHour: string;
}

export class TenantCreateMealPeriodDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  startHour: string;

  @IsString()
  @ApiProperty()
  endHour: string;
}

export class UpdateMealPeriodDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  startHour: string;

  @IsString()
  @ApiProperty()
  endHour: string;
}
