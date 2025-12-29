import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { OrderType } from "database/entities/order.entity";

export class CreateOrderItemModifierOptionDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  quantity: number;
}

export class CreateOrderItemModifierDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsArray()
  @Type(() => CreateOrderItemModifierOptionDTO)
  @ApiProperty({
    isArray: true,
    type: CreateOrderItemModifierOptionDTO,
  })
  options: CreateOrderItemModifierOptionDTO[];
}

export class CreateOrderItemDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  voucherCodeId?: number;

  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsArray()
  @Type(() => CreateOrderItemModifierDTO)
  @ApiProperty({
    isArray: true,
    type: CreateOrderItemModifierDTO,
  })
  modifiers: CreateOrderItemModifierDTO[];
}

export class CreateOrderDTO {
  @IsString()
  @ApiProperty()
  clientName: string;

  @IsString()
  @ApiProperty()
  clientNumber: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  clientEmail?: string;

  @IsEnum(OrderType)
  @ApiProperty()
  orderType: OrderType;

  @IsNumber()
  @ApiProperty()
  mealPeriodId: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  voucherCodeId?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  referralId?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  rideGrandTotal?: number;

  @IsNumber()
  @ApiProperty()
  hotelId: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  merchantId?: number;

  // @IsDateString()
  @ApiProperty()
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @ApiProperty()
  @IsOptional()
  comment?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @ApiProperty()
  tip: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  numberOfCutleries?: string;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  hasAlcohol?: boolean;

  @IsBoolean()
  @ApiProperty({ default: false })
  @IsOptional()
  isCatering?: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => CreateOrderItemDTO)
  @ApiProperty({
    isArray: true,
    type: CreateOrderItemDTO,
  })
  items?: CreateOrderItemDTO[] = [];

  @IsOptional()
  timezone?: string;
}
