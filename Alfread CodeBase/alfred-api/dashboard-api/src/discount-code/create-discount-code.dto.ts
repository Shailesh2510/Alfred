import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { AmountType, DiscountCodeAccessType, DiscountCodeType } from "database/entities/discount-code.entity";

export class APICreateDiscountCodeDTO {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @ApiProperty({
    enum: DiscountCodeType
  })
  type: DiscountCodeType;

  @ApiProperty()
  @ApiProperty({
    enum: DiscountCodeAccessType
  })
  accessType: DiscountCodeAccessType;

  @ApiProperty()
  hotelIds: number[];

  @IsEnum(AmountType)
  @ApiProperty({
    enum: AmountType
  })
  amountType: AmountType;

  @IsNumber()
  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class APIUpdateDiscountCodeDTO {
  @ApiProperty()
  @IsString()
  code: string;
}
