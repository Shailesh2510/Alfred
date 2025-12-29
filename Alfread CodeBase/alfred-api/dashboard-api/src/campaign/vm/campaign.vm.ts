import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsString, IsNumber, IsOptional } from "class-validator";
import { BaseVM } from "../../base.vm";

export class CampaignVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsString()
  @ApiProperty()
  @Expose()
  description: string;

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
    return plainToClass(CampaignVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
