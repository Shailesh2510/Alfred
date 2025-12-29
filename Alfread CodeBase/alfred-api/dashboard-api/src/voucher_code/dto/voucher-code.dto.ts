import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean } from "class-validator";
import { PaginateRequestDTO } from "pagination";

export class VoucherCodeListQueryParams extends PaginateRequestDTO {
  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  claimed?: string;
}
