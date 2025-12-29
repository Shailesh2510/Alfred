import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { VoucherProgramPayer, VoucherProgramType } from "../../../database/entities/voucher_program.entity";
import { AmountType } from "src/order/calculation";

export class VoucherProgramRuleDTO {
  @IsNumber()
  @ApiProperty()
  mealPeriodId: number;

  @IsArray()
  @IsNumber({}, {each: true})
  @ApiProperty()
  menuCategoryIds: number[]

  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsNumber()
  @ApiProperty()
  maxPrice: number
}

export class CreateVoucherProgramDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  discountCode?: string;

  @IsEnum(AmountType)
  @ApiProperty({
    enum: AmountType
  })
  amountType: AmountType = AmountType.FIXED;

  @IsEnum(VoucherProgramType)
  @ApiProperty({
    enum: VoucherProgramType
  })
  type: VoucherProgramType;

  @IsEnum(VoucherProgramPayer)
  @ApiProperty({
    enum: VoucherProgramPayer
  })
  payer: VoucherProgramPayer;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty()
  payerPercentage: number;

  @IsNumber()
  @ApiProperty()
  totalAmount: number;

  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  hotelIds: number[];

  @IsString()
  @ApiProperty()
  @IsOptional()
  hotelWebCode?: string;

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
}
