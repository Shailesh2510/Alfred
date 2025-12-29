import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { OrderStatusEnum, OrderType } from "../../../database/entities/order.entity";
import { PaginateRequestDTO } from "../../../pagination";
import { VoucherProgramType } from "../../../database/entities/voucher_program.entity";
import Stripe from "stripe";

export class OrderListQueryParams extends PaginateRequestDTO {
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
  date?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  fromDate?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  toDate?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  orderDate?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  status?: OrderStatusEnum;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  clientName?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  clientNumber?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  clientEmail?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  hotelId?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  merchantId?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  voucherCode?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  voucherType?: VoucherProgramType;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  orderType?: OrderType;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  mealPeriodId?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  id: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  nonce: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  roomNumber?: string;
}

export class OrderListFilters extends OrderListQueryParams {}

export class APIRefundOrderDTO {
  @IsString()
  @ApiProperty()
  amount: string;

  @IsString()
  @ApiProperty()
  reason: Stripe.RefundCreateParams.Reason;

  @IsString()
  @IsOptional()
  @ApiProperty()
  note?: string;
}

export class OrderCommissionListQueryParams extends OrderListQueryParams {
  @IsString()
  @ApiProperty()
  @IsOptional()
  @ApiPropertyOptional()
  ambassador_name: string;

}

export class OrderCommissionListFilters extends OrderCommissionListQueryParams {}
