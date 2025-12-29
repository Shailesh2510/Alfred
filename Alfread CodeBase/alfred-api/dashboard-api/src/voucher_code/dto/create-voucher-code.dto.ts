import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { PaginateRequestDTO } from "pagination";

export class ListVoucherCodeFilters extends PaginateRequestDTO {
  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  tenant_mock_hotel_id?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  tenant_mock_merchant_id?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  code?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  voucherProgramId?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  claimed?: string;
}

export class CreateVoucherCodeDTO {
  @IsNumber()
  @ApiProperty()
  voucherProgramId: number;

  @IsNumber()
  @ApiProperty()
  hotelId: number;

  @IsNumber()
  @ApiProperty()
  numberOfCodes: number;

  @IsString()
  @IsOptional()
  hotelWebCode?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  dateAllowed?: string;
}

export class HotelCreateVoucherCodeDTO {
  @IsNumber()
  @ApiProperty()
  voucherProgramId: number;

  @IsNumber()
  @ApiProperty()
  numberOfCodes: number;
}
