import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber } from "class-validator";
import { PaginateRequestDTO } from "../../../pagination";
import { VoucherProgramType } from "database/entities/voucher_program.entity";

export class VoucherProgramListQueryParams extends PaginateRequestDTO {
  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  type?: VoucherProgramType;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
  
  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  isActive?: boolean;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  hotelId?: number;
}
