import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsString, IsNumber, IsDateString, IsOptional } from "class-validator";
import { BaseVM } from "../../base.vm";

export class ReferralVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  ambassador_id: string;

  @IsString()
  @ApiProperty()
  @Expose()
  campaign_id: string;

  @IsString()
  @ApiProperty()
  @Expose()
  ambassador_name: string;

  @IsString()
  @ApiProperty()
  @Expose()
  short_code: string;

  @ApiProperty()
  @Expose({ name: "createdAt" })
  created_at: string;

  @ApiProperty()
  @Expose({ name: "updatedAt" })
  updated_at: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Expose({ name: "deletedAt" })
  deleted_at?: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(ReferralVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
