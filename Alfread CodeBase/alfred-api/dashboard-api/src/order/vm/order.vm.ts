import { ApiProperty } from "@nestjs/swagger";
import { plainToClass, Expose } from "class-transformer";
import { BaseVM } from "src/base.vm";
import {
  OrderStatusEnum,
  OrderType,
} from "../../../database/entities/order.entity";
import { OrderItemVM } from "./order-item.vm";
import Api from "twilio/lib/rest/Api";

export class OrderSimpleListItemVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose({ name: "order_number" })
  orderNumber: number;

  @ApiProperty()
  @Expose()
  hotelId: number;

  @ApiProperty()
  @Expose()
  hotelName: number;

  @ApiProperty()
  @Expose()
  status: OrderStatusEnum;

  @ApiProperty()
  @Expose({ name: "client_name" })
  clientName: string;

  @ApiProperty()
  @Expose({ name: "client_number" })
  clientNumber: string;

  @ApiProperty()
  @Expose({ name: "order_type" })
  orderType: OrderType;

  @ApiProperty()
  @Expose({ name: "voucher_code" })
  voucherCode: string;

  @ApiProperty()
  @Expose({ name: "voucher_code_id" })
  voucherCodeId: number;

  @ApiProperty()
  @Expose({ name: "receipt_amount" })
  receiptAmount: number;

  @ApiProperty()
  @Expose({ name: "total_net" })
  totalNet: number;

  @ApiProperty()
  @Expose({ name: "tax_amount" })
  taxAmount: number;

  @ApiProperty()
  @Expose({ name: "total_gross" })
  totalGross: number;

  @ApiProperty()
  @Expose({ name: "grand_total" })
  grandTotal: number;

  @ApiProperty()
  @Expose({ name: "voucher_price" })
  voucherPrice: number;

  @ApiProperty()
  @Expose({ name: "refund_amount" })
  refundAmount: number;

  @ApiProperty()
  @Expose({ name: "hotel_total_net" })
  hotelTotalNet: number;

  @ApiProperty()
  @Expose({ name: "hotel_tax_amount" })
  hotelTaxAmount: number;

  @ApiProperty()
  @Expose({ name: "hotel_total_gross" })
  hotelTotalGross: number;

  @ApiProperty()
  @Expose({ name: "hotel_grand_total" })
  hotelGrandTotal: number;

  @ApiProperty()
  @Expose({ name: "created_at" })
  public createdAt: Date;

  @ApiProperty()
  @Expose({ name: "updated_at" })
  public updatedAt: Date;

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderSimpleListItemVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrderDetailsVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: string | number;

  @ApiProperty()
  @Expose({
    name: "payment_status",
  })
  paymentStatus: string;

  @ApiProperty()
  @Expose()
  nonce: string | number;

  @ApiProperty()
  @Expose()
  version: number;

  @ApiProperty()
  @Expose()
  hotelName: number;

  @ApiProperty()
  @Expose()
  hotelCode: number;

  @ApiProperty()
  @Expose()
  hotelWebCode: number;

  @ApiProperty()
  @Expose()
  hotelUuid: string;

  @ApiProperty()
  @Expose()
  hotelAddressNumber: string;

  @ApiProperty()
  @Expose()
  hotelAddressStreet: string;

  @ApiProperty()
  @Expose()
  hotelAddressTown: string;

  @ApiProperty()
  @Expose()
  hotelAddressZipCode: string;

  @ApiProperty()
  @Expose()
  hotelId: string;

  @ApiProperty()
  @Expose()
  mealPeriodId: string;

  @ApiProperty()
  @Expose()
  merchantId: string;

  @ApiProperty()
  @Expose()
  merchantName: string;

  @ApiProperty()
  @Expose()
  mealPeriodName: string;

  @ApiProperty()
  @Expose()
  orderNumber: number;

  @ApiProperty()
  @Expose()
  status: OrderStatusEnum;

  @ApiProperty()
  @Expose()
  clientName: string;

  @ApiProperty()
  @Expose()
  clientNumber: string;

  @ApiProperty()
  @Expose()
  clientEmail: string;

  @ApiProperty()
  @Expose()
  orderType: OrderType;

  @ApiProperty()
  @Expose()
  voucherCode: string;

  @ApiProperty()
  @Expose()
  receiptAmount: string;

  @ApiProperty()
  @Expose()
  tip: string;

  @ApiProperty()
  @Expose()
  totalNet: number;

  @ApiProperty()
  @Expose()
  taxAmount: number;

  @ApiProperty()
  @Expose()
  totalGross: number;

  @ApiProperty()
  @Expose()
  grandTotal: number;

  @ApiProperty()
  @Expose()
  voucherPrice: number;

  @ApiProperty()
  @Expose()
  refundAmount: number;

  @ApiProperty()
  @Expose()
  hotelTotalNet: number;

  @ApiProperty()
  @Expose()
  hotelTaxAmount: number;

  @ApiProperty()
  @Expose()
  hotelTotalGross: number;

  @ApiProperty()
  @Expose()
  hotelGrandTotal: number;

  @ApiProperty()
  @Expose()
  items: OrderItemVM[];

  @ApiProperty()
  @Expose()
  comment?: string;

  @ApiProperty()
  @Expose()
  roomNumber: string;

  @ApiProperty()
  @Expose()
  cancelReason?: string;

  @ApiProperty()
  @Expose()
  cancelOption?: string;

  @ApiProperty()
  @Expose()
  deliveryFee?: number;

  @ApiProperty()
  @Expose()
  relayResponse: { [key: string]: string };

  @ApiProperty()
  @Expose()
  paymentIntentId: string;

  @ApiProperty()
  @Expose()
  relayUrl: string;

  @ApiProperty()
  @Expose()
  stripeUrl: string;

  @ApiProperty()
  @Expose()
  numberOfCutleries: number;

  @ApiProperty()
  @Expose()
  scheduledDate: Date;

  @ApiProperty()
  @Expose()
  appliedVoucherAmount: number;

  @ApiProperty()
  @Expose()
  timezone: string;

  @ApiProperty()
  @Expose()
  public createdAt: Date;

  @ApiProperty()
  @Expose()
  public updatedAt: Date;

  @ApiProperty()
  @Expose()
  public orderDate: Date;

  @ApiProperty()
  @Expose()
  public voucherPayer: string;

  @ApiProperty()
  @Expose()
  public voucherType: string;

  @ApiProperty()
  @Expose()
  public delivered_on: string;

  @ApiProperty({ default: false })
  @Expose({ name: "is_catering" })
  public isCatering?: boolean;

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderDetailsVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedOrderVM extends OrderDetailsVM {
  @ApiProperty()
  @Expose()
  id: string | number;

  @ApiProperty()
  @Expose()
  nonce: string | number;

  @ApiProperty()
  @Expose()
  version: number;

  @ApiProperty()
  @Expose({
    name: "hotel_name",
  })
  hotelName: number;

  @ApiProperty()
  @Expose({
    name: "hotel_code",
  })
  hotelCode: number;

  @ApiProperty()
  @Expose({
    name: "ambassador_name",
  })
  ambassadorName?: string;

  @ApiProperty()
  @Expose({
    name: "hotel_web_code",
  })
  hotelWebCode: number;

  @ApiProperty()
  @Expose({
    name: "hotel_uuid",
  })
  hotelUuid: string;

  @ApiProperty()
  @Expose({
    name: "hotel_address_number",
  })
  hotelAddressNumber: string;

  @ApiProperty()
  @Expose({
    name: "hotel_address_street",
  })
  hotelAddressStreet: string;

  @ApiProperty()
  @Expose({
    name: "hotel_address_town",
  })
  hotelAddressTown: string;

  @ApiProperty()
  @Expose({
    name: "hotel_address_zip_code",
  })
  hotelAddressZipCode: string;

  @ApiProperty()
  @Expose({
    name: "hotel_id",
  })
  hotelId: string;

  @ApiProperty()
  @Expose({
    name: "meal_period_id",
  })
  mealPeriodId: string;

  @ApiProperty()
  @Expose({
    name: "merchant_id",
  })
  merchantId: string;

  @ApiProperty()
  @Expose({
    name: "merchant_name",
  })
  merchantName: string;

  @ApiProperty()
  @Expose({
    name: "is_paid",
  })
  isPaid: string;

  @ApiProperty()
  @Expose({
    name: "merchant_type",
  })
  merchantType: string;

  @ApiProperty()
  @Expose({
    name: "merchant_address_number",
  })
  merchantAddressNumber?: string;

  @ApiProperty()
  @Expose({
    name: "merchant_address_street",
  })
  merchantAddressStreet?: string;

  @ApiProperty()
  @Expose({
    name: "merchant_address_town",
  })
  merchantAddressTown?: string;

  @ApiProperty()
  @Expose({
    name: "merchant_address_zip_code",
  })
  merchantAddressZipCode?: string;

  @ApiProperty()
  @Expose({
    name: "merchant_color",
  })
  merchantColor?: string;

  @ApiProperty()
  @Expose({
    name: "meal_period_name",
  })
  mealPeriodName: string;

  @ApiProperty()
  @Expose({
    name: "order_number",
  })
  orderNumber: number;

  @ApiProperty()
  @Expose()
  status: OrderStatusEnum;

  @ApiProperty()
  @Expose({
    name: "payment_status",
  })
  paymentStatus: string;

  @ApiProperty()
  @Expose({
    name: "client_name",
  })
  clientName: string;

  @ApiProperty()
  @Expose({
    name: "client_number",
  })
  clientNumber: string;

  @ApiProperty()
  @Expose({
    name: "client_email",
  })
  clientEmail: string;

  @ApiProperty()
  @Expose({
    name: "order_type",
  })
  orderType: OrderType;

  @ApiProperty()
  @Expose({
    name: "voucher_code",
  })
  voucherCode: string;

  @ApiProperty()
  @Expose({
    name: "receipt_amount",
  })
  receiptAmount: string;

  @ApiProperty()
  @Expose()
  tip: string;

  @ApiProperty()
  @Expose({
    name: "total_net",
  })
  totalNet: number;

  @ApiProperty()
  @Expose({
    name: "tax_amount",
  })
  taxAmount: number;

  @ApiProperty()
  @Expose({
    name: "total_gross",
  })
  totalGross: number;

  @ApiProperty()
  @Expose({
    name: "grand_total",
  })
  grandTotal: number;

  @ApiProperty()
  @Expose({
    name: "voucher_price",
  })
  voucherPrice: number;

  @ApiProperty()
  @Expose({
    name: "refund_amount",
  })
  refundAmount: number;

  @ApiProperty()
  @Expose({
    name: "hotel_total_net",
  })
  hotelTotalNet: number;

  @ApiProperty()
  @Expose({
    name: "hotel_tax_amount",
  })
  hotelTaxAmount: number;

  @ApiProperty()
  @Expose({
    name: "hotel_total_gross",
  })
  hotelTotalGross: number;

  @ApiProperty()
  @Expose({
    name: "hotel_grand_total",
  })
  hotelGrandTotal: number;

  @ApiProperty()
  @Expose()
  items: OrderItemVM[];

  @ApiProperty()
  @Expose()
  comment?: string;

  @ApiProperty()
  @Expose({
    name: "room_number",
  })
  roomNumber: string;

  @ApiProperty()
  @Expose({
    name: "cancel_reason",
  })
  cancelReason?: string;

  @ApiProperty()
  @Expose({
    name: "cancel_option",
  })
  cancelOption?: string;

  @ApiProperty()
  @Expose({
    name: "delivery_fee",
  })
  deliveryFee?: number;

  @ApiProperty()
  @Expose()
  relayResponse: { [key: string]: string };

  @ApiProperty()
  @Expose()
  paymentIntentId: string;

  @ApiProperty()
  @Expose()
  relayUrl: string;

  @ApiProperty()
  @Expose()
  stripeUrl: string;

  @ApiProperty()
  @Expose({
    name: "number_of_cutleries",
  })
  numberOfCutleries: number;

  @ApiProperty()
  @Expose({
    name: "scheduled_date",
  })
  scheduledDate: Date;

  @ApiProperty()
  @Expose({
    name: "applied_voucher_amount",
  })
  appliedVoucherAmount: number;

  @ApiProperty()
  @Expose()
  timezone: string;

  @ApiProperty()
  @Expose({
    name: "created_at",
  })
  public createdAt: Date;

  @ApiProperty()
  @Expose({
    name: "updated_at",
  })
  public updatedAt: Date;

  @ApiProperty()
  @Expose({
    name: "order_date",
  })
  public orderDate: Date;

  @ApiProperty()
  @Expose()
  public payer: string;

  @ApiProperty()
  @Expose()
  public type: string;

  @ApiProperty()
  @Expose()
  public delivered_on: string;

  @ApiProperty()
  @Expose({
    name: "payer",
  })
  public voucherPayer: string;

  @ApiProperty()
  @Expose({
    name: "type",
  })
  public voucherType: string;

  @ApiProperty()
  @Expose({
    name: "payer_percentage",
  })
  public voucherPayerPercentage: number;

  @ApiProperty()
  @Expose({
    name: "total_amount",
  })
  public voucherTotalAmount: number;

  @ApiProperty()
  @Expose({
    name: "hotel_has_third_party_delivery",
  })
  public hotelHasThirdPartyDelivery: boolean;

  @ApiProperty()
  @Expose({
    name: "merchant_has_third_party_delivery",
  })
  public merchantHasThirdPartyDelivery: boolean;

  toVM<T>(input: T | T[]) {
    return plainToClass(DetailedOrderVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrderWithCommissionsVM extends BaseVM {
  @ApiProperty()
  @Expose()
  merchantType: string;

  @ApiProperty()
  @Expose({
    name: "commission_amount"
  })
  commissionAmount: number;

  @ApiProperty()
  @Expose({
    name: "is_approved"
  })
  isApproved: string;

  @ApiProperty()
  @Expose({
    name: "referring_name"
  })
  referrer: string;

  @ApiProperty()
  @Expose({
    name: "campaign_uid__name"
  })
  campaignName: string;

  @ApiProperty()
  @Expose({
    name: "updatedAt"
  })
  deliveryDate: Date;

  @ApiProperty()
  @Expose({
    name: "transaction_id",
  })
  nonce: Date;

  toVM<T>(input: T | T[]) {
    return plainToClass(OrderWithCommissionsVM, input, {
      excludeExtraneousValues: true,
    });
  }
}