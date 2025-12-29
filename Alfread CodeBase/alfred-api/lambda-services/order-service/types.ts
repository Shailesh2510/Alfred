import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export enum OrderType {
  ROOM_CHARGE = "ROOM_CHARGE",
  CREDIT_CARD = "CREDIT_CARD",
}

export class CreateOrderItemModifierOptionDTO {
  @IsNumber()
  id: number;

  @IsNumber()
  quantity: number;
}

export class CreateOrderItemModifierDTO {
  @IsNumber()
  id: number;

  @IsArray()
  options: CreateOrderItemModifierOptionDTO[];
}

export class CreateOrderItemDTO {
  @IsNumber()
  id: number;

  @IsNumber()
  @IsOptional()
  voucherCodeId?: number;

  @IsNumber()
  quantity: number;

  @IsArray()
  modifiers: CreateOrderItemModifierDTO[];
}

export class CreateOrderDTO {
  @IsString()
  clientName: string;

  @IsString()
  clientNumber: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNumber()
  mealPeriodId: number;

  @IsNumber()
  @IsOptional()
  voucherCodeId?: number;

  @IsNumber()
  @IsOptional()
  referralId?: number;

  @IsString()
  hotelId: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsNumber()
  @IsOptional()
  rideGrandTotal?: number;

  @IsDateString()
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  tip: string;

  @IsString()
  @IsOptional()
  numberOfCutleries?: string;

  @IsBoolean()
  @IsOptional()
  hasAlcohol?: boolean = false;

  @IsOptional()
  @IsArray()
  items?: CreateOrderItemDTO[] = [];

  timezone: string;
}
