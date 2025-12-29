import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { VoucherProgramRuleDTO } from "./create-voucher-program.dto";
import { VoucherProgramPayer } from "database/entities/voucher_program.entity";
import { AmountType } from "src/order/calculation";

export class UpdateVoucherProgramDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    isArray: true,
    type: VoucherProgramRuleDTO
  })
  @Type(() => VoucherProgramRuleDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  rules?: VoucherProgramRuleDTO[]

  @IsBoolean()
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(AmountType)
  @ApiProperty({
    enum: AmountType
  })
  @IsOptional()
  amountType?: AmountType;

  @IsEnum(VoucherProgramPayer)
  @ApiProperty({
    enum: VoucherProgramPayer
  })
  @IsOptional()
  payer?: VoucherProgramPayer;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty()
  @IsOptional()
  payerPercentage?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  totalAmount?: number;

  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  @IsOptional()
  hotelIds?: number[];
}