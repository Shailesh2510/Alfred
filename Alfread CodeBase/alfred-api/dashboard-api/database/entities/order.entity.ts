import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AuditEntity } from "./audit.entity";
import { DECIMAL_COLUMN } from "helpers";
import { plainToClass } from "class-transformer";

export enum OrderType {
  ROOM_CHARGE = "ROOM_CHARGE",
  CREDIT_CARD = "CREDIT_CARD",
  PAY_LATER = "PAY_LATER",
}

export enum OrderStatusEnum {
  INITIATED = "INITIATED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARATION = "PREPARATION",
  IN_DELIVERY = "IN_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  SCHEDULED = "SCHEDULED",
  CARMEL_TRIP_CREATED = "CARMEL_TRIP_CREATED",
}

export enum RelayOrderStatusEnum {
  RELAY_ORDER_PLACED = "order_placed",
  RELAY_ORDER_VOID = "order_void",
  RELAY_RIDER_AT_PRODUCER = "rider_at_producer",
  RELAY_ORDER_PICKUP_PAUSED = "order_pickup_paused",
  RELAY_ORDER_PICKED_UP = "order_picked_up",
  RELAY_RIDER_AT_CONSUMER = "rider_at_consumer",
  RELAY_ORDER_EN_ROUTE_FOR_DELIVERY = "order_en_route_for_delivery",
  RELAY_ORDER_DELIVERED = "order_delivered",
  RELAY_ORDER_DELIVERY_FAILED = "order_delivery_failed",
  RELAY_ORDER_DELIVERY_RETURNED = "order_delivery_returned",
  RELAY_RIDER_ACCEPTED = "rider_accepted",
  RELAY_RIDER_CANCELLED = "rider_cancelled",
  RELAY_RIDER_LOCATION = "rider_location",
  RELAY_ORDER_DETAILS_EDITED = "order_details_edited",
}

export enum ShipdayOrderStatusEnum {
  NOT_ASSIGNED = "NOT_ASSIGNED",
  NOT_ACCEPTED = "NOT_ACCEPTED",
  NOT_STARTED_YET = "NOT_STARTED_YET",
  STARTED = "STARTED",
  PICKED_UP = "PICKED_UP",
  READY_TO_DELIVER = "READY_TO_DELIVER",
  ALREADY_DELIVERED = "ALREADY_DELIVERED",
  INCOMPLETE = "INCOMPLETE",
  FAILED_DELIVERY = "FAILED_DELIVERY",
}

@Entity("orders")
export class Order extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "_id",
  })
  _id: string;

  @Column({
    name: "nonce",
  })
  nonce: string;

  @Column({
    name: "hotel_id",
  })
  hotelId: number;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column({
    name: "order_number",
  })
  orderNumber: number;

  @Column()
  status: OrderStatusEnum;

  @Column({
    name: "client_name",
  })
  clientName: string;

  @Column({
    name: "client_number",
  })
  clientNumber: string;

  @Column({
    name: "client_email",
  })
  clientEmail: string;

  @Column({
    name: "order_type",
  })
  orderType: OrderType;

  @Column({
    name: "voucher_code",
  })
  voucherCode?: string;

  @Column({
    name: "voucher_code_id",
  })
  voucherCodeId?: number;

  @Column({
    name: "referral_id",
  })
  referralId?: number;

  @Column(DECIMAL_COLUMN, {
    name: "receipt_amount",
  })
  receiptAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "total_net",
  })
  totalNet: number;

  @Column(DECIMAL_COLUMN, {
    name: "tax_amount",
  })
  taxAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "total_gross",
  })
  totalGross: number;

  @Column(DECIMAL_COLUMN, {
    name: "grand_total",
  })
  grandTotal: number;

  @Column(DECIMAL_COLUMN, {
    name: "voucher_price",
  })
  voucherPrice: number;

  @Column(DECIMAL_COLUMN, {
    name: "applied_voucher_amount",
  })
  appliedVoucherAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "refund_amount",
  })
  refundAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "hotel_total_net",
  })
  hotelTotalNet: number;

  @Column(DECIMAL_COLUMN, {
    name: "hotel_tax_amount",
  })
  hotelTaxAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "hotel_total_gross",
  })
  hotelTotalGross: number;

  @Column(DECIMAL_COLUMN, {
    name: "hotel_grand_total",
  })
  hotelGrandTotal: number;

  @Column({
    type: "timestamptz",
    name: "scheduled_date",
  })
  scheduledDate?: Date;

  @Column()
  comment?: string;

  @Column({
    name: "room_number",
  })
  roomNumber: string;

  @Column({
    name: "cancel_reason",
  })
  cancelReason?: string;

  @Column({
    name: "cancel_option",
  })
  cancelOption?: string;

  @Column(DECIMAL_COLUMN, {
    name: "tip",
  })
  tip: number;

  @Column(DECIMAL_COLUMN, {
    name: "delivery_fee",
  })
  deliveryFee: number;

  @Column({
    name: "meal_period_id",
  })
  mealPeriodId: number;

  @Column({
    name: "payment_status",
  })
  paymentStatus: string;

  @Column({
    type: "timestamptz",
    name: "order_date",
  })
  orderDate: Date;

  @Column({
    name: "number_of_cutleries",
  })
  numberOfCutleries: number;

  @Column({
    name: "has_alcohol",
    default: false,
  })
  hasAlcohol: boolean;

  @Column({
    name: "is_catering",
    default: false,
  })
  isCatering: boolean;

  static Builder = class {
    hotelId: number;
    merchantId: number;
    orderNumber: number;
    status: OrderStatusEnum;
    clientName: string;
    clientNumber: string;
    clientEmail?: string;
    orderType: OrderType;
    voucherCode: string;
    voucherCodeId: number;
    receiptAmount: number;
    totalNet: number;
    taxAmount: number;
    totalGross: number;
    grandTotal: number;
    voucherPrice: number;
    appliedVoucherAmount: number;
    refundAmount: number;
    hotelTotalNet: number;
    hotelTaxAmount: number;
    hotelTotalGross: number;
    hotelGrandTotal: number;
    scheduledDate: Date;
    comment: string;
    roomNumber: string;
    cancelReason: string;
    cancelOption: string;
    tip: number;
    deliveryFee: number;
    mealPeriodId: number;
    paymentStatus: string;
    orderDate: Date;
    numberOfCutleries: number;
    hasAlcohol: boolean;
    isCatering: boolean;
    order: Order;
    referralId: number;

    setHotelId(hotelId: number) {
      this.hotelId = hotelId;
      return this;
    }
    setMerchantId(merchantId: number) {
      this.merchantId = merchantId;
      return this;
    }
    setOrderNumber(orderNumber: number) {
      this.orderNumber = orderNumber;
      return this;
    }
    setStatus(status: OrderStatusEnum) {
      this.status = status;
      return this;
    }
    setClientName(name: string) {
      this.clientName = name;
      return this;
    }
    setClientNumber(number: string) {
      this.clientNumber = number;
      return this;
    }
    setClientEmail(email: string) {
      this.clientEmail = email;
      return this;
    }
    setOrderType(type: OrderType) {
      this.orderType = type;
      return this;
    }
    setVoucherCode(voucherCode: string) {
      this.voucherCode = voucherCode;
      return this;
    }
    setVoucherCodeId(voucherCodeId: number) {
      this.voucherCodeId = voucherCodeId;
      return this;
    }
    setReferralId(referralId: number) {
      this.referralId = referralId;
      return this;
    }
    setReceiptAmount(receiptAmount: number) {
      this.receiptAmount = receiptAmount;
      return this;
    }
    setTotalNet(totalNet: number) {
      this.totalNet = totalNet;
      return this;
    }
    setTaxAmount(taxAmount: number) {
      this.taxAmount = taxAmount;
      return this;
    }
    setTotalGross(totalGross: number) {
      this.totalGross = totalGross;
      return this;
    }
    setGrandTotal(grandTotal: number) {
      this.grandTotal = grandTotal;
      return this;
    }
    setVoucherPrice(voucherPrice: number) {
      this.voucherPrice = voucherPrice;
      return this;
    }
    setAppliedVoucherAmount(input: number) {
      this.appliedVoucherAmount = input;
      return this;
    }
    setRefundAmount(refundAmount: number) {
      this.refundAmount = refundAmount;
      return this;
    }
    setHotelTotalNet(hotelTotalNet: number) {
      this.hotelTotalNet = hotelTotalNet;
      return this;
    }
    setHotelTaxAmount(hotelTaxAmount: number) {
      this.hotelTaxAmount = hotelTaxAmount;
      return this;
    }
    setHotelTotalGross(hotelTotalGross: number) {
      this.hotelTotalGross = hotelTotalGross;
      return this;
    }
    setHotelGrandTotal(hotelGrandTotal: number) {
      this.hotelGrandTotal = hotelGrandTotal;
      return this;
    }
    setScheduledDate(scheduledDate: Date) {
      this.scheduledDate = scheduledDate;
      return this;
    }
    setComment(comment: string) {
      this.comment = comment;
      return this;
    }
    setRoomNumber(roomNumber: string) {
      this.roomNumber = roomNumber;
      return this;
    }
    setCancelReason(cancelReason: string) {
      this.cancelReason = cancelReason;
      return this;
    }
    setCancelOption(val: string) {
      this.cancelOption = val;
      return this;
    }
    setTip(tip: number) {
      this.tip = tip;
      return this;
    }
    setDeliveryFee(deliveryFee: number) {
      this.deliveryFee = deliveryFee;
      return this;
    }
    setMealPeriodId(mealPeriodId: number) {
      this.mealPeriodId = mealPeriodId;
      return this;
    }
    setPaymentStatus(paymentStatus: string) {
      this.paymentStatus = paymentStatus;
      return this;
    }
    setOrderDate(val: Date) {
      this.orderDate = val;
      return this;
    }
    setNumberOfCutleries(val: number) {
      this.numberOfCutleries = val;
      return this;
    }
    setHasAlcohol(val: boolean) {
      this.hasAlcohol = val;
      return this;
    }
    setIsCatering(val: boolean) {
      this.isCatering = val;
      return this;
    }

    build() {
      this.order = new Order();
      this.order.hotelId = this.hotelId;
      this.order.merchantId = this.merchantId;
      this.order.orderNumber = this.orderNumber;
      this.order.status = this.status;
      this.order.clientName = this.clientName;
      this.order.clientNumber = this.clientNumber;
      this.order.orderType = this.orderType;
      this.order.voucherCode = this.voucherCode;
      this.order.voucherCodeId = this.voucherCodeId;
      this.order.receiptAmount = this.receiptAmount;
      this.order.totalNet = this.totalNet;
      this.order.taxAmount = this.taxAmount;
      this.order.totalGross = this.totalGross;
      this.order.grandTotal = this.grandTotal;
      this.order.voucherPrice = this.voucherPrice;
      this.order.appliedVoucherAmount = this.appliedVoucherAmount;
      this.order.refundAmount = this.refundAmount;
      this.order.hotelTotalNet = this.hotelTotalNet;
      this.order.hotelTaxAmount = this.hotelTaxAmount;
      this.order.hotelTotalGross = this.hotelTotalGross;
      this.order.hotelGrandTotal = this.hotelGrandTotal;
      this.order.scheduledDate = this.scheduledDate;
      this.order.comment = this.comment;
      this.order.roomNumber = this.roomNumber;
      this.order.cancelReason = this.cancelReason;
      this.order.tip = this.tip;
      this.order.deliveryFee = this.deliveryFee;
      this.order.mealPeriodId = this.mealPeriodId;
      this.order.clientEmail = this.clientEmail;
      this.order.cancelOption = this.cancelOption;
      this.order.orderDate = this.orderDate;
      this.order.numberOfCutleries = this.numberOfCutleries;
      this.order.hasAlcohol = this.hasAlcohol;
      this.order.isCatering = this.isCatering;
      this.order.referralId = this.referralId;
      return this.order;
    }
  };

  toEntity<T>(input: T | T[]) {
    return plainToClass(Order, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("order_calculations")
export class OrderCalculation {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "receipt_amount",
  })
  receiptAmount: number;

  @Column({
    name: "order_id",
  })
  orderId: number;

  @Column({
    name: "total_net",
  })
  totalNet: number;

  @Column({
    name: "tax_amount",
  })
  taxAmount: number;

  @Column({
    name: "total_gross",
  })
  totalGross: number;

  @Column({
    name: "grand_total",
  })
  grandTotal: number;

  @Column({
    name: "voucher_price",
  })
  voucherPrice: number;

  @Column({
    name: "refund_amount",
  })
  refundAmount: number;

  @Column({
    name: "hotel_total_net",
  })
  hotelTotalNet: number;

  @Column({
    name: "hotel_tax_amount",
  })
  hotelTaxAmount: number;

  @Column({
    name: "hotel_total_gross",
  })
  hotelTotalGross: number;

  @Column({
    name: "hotel_grand_total",
  })
  hotelGrandTotal: number;

  @Column({
    name: "tip",
  })
  tip: number;

  @Column({
    name: "delivery_fee",
  })
  deliveryFee: number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
    name: "updated_at",
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
  })
  deletedAt?: Date;

  static Builder = class {
    receiptAmount: number;
    totalNet: number;
    taxAmount: number;
    totalGross: number;
    grandTotal: number;
    voucherPrice: number;
    appliedVoucherAmount: number;
    refundAmount: number;
    hotelTotalNet: number;
    hotelTaxAmount: number;
    hotelTotalGross: number;
    hotelGrandTotal: number;
    tip: number;
    deliveryFee: number;
    orderCalculation = new OrderCalculation();

    setReceiptAmount(receiptAmount: number) {
      this.receiptAmount = receiptAmount;
      return this;
    }
    setTotalNet(totalNet: number) {
      this.totalNet = totalNet;
      return this;
    }
    setTaxAmount(taxAmount: number) {
      this.taxAmount = taxAmount;
      return this;
    }
    setTotalGross(totalGross: number) {
      this.totalGross = totalGross;
      return this;
    }
    setGrandTotal(grandTotal: number) {
      this.grandTotal = grandTotal;
      return this;
    }
    setVoucherPrice(voucherPrice: number) {
      this.voucherPrice = voucherPrice;
      return this;
    }
    setAppliedVoucherAmount(input: number) {
      this.appliedVoucherAmount = input;
      return this;
    }
    setRefundAmount(refundAmount: number) {
      this.refundAmount = refundAmount;
      return this;
    }
    setHotelTotalNet(hotelTotalNet: number) {
      this.hotelTotalNet = hotelTotalNet;
      return this;
    }
    setHotelTaxAmount(hotelTaxAmount: number) {
      this.hotelTaxAmount = hotelTaxAmount;
      return this;
    }
    setHotelTotalGross(hotelTotalGross: number) {
      this.hotelTotalGross = hotelTotalGross;
      return this;
    }
    setHotelGrandTotal(hotelGrandTotal: number) {
      this.hotelGrandTotal = hotelGrandTotal;
      return this;
    }
    setTip(tip: number) {
      this.tip = tip;
      return this;
    }
    setDeliveryFee(deliveryFee: number) {
      this.deliveryFee = deliveryFee;
      return this;
    }
    build() {
      this.orderCalculation.receiptAmount = this.receiptAmount;
      this.orderCalculation.totalNet = this.totalNet;
      this.orderCalculation.taxAmount = this.taxAmount;
      this.orderCalculation.totalGross = this.totalGross;
      this.orderCalculation.grandTotal = this.grandTotal;
      this.orderCalculation.voucherPrice = this.voucherPrice;
      this.orderCalculation.refundAmount = this.refundAmount;
      this.orderCalculation.hotelTotalNet = this.hotelTotalNet;
      this.orderCalculation.hotelTaxAmount = this.hotelTaxAmount;
      this.orderCalculation.hotelTotalGross = this.hotelTotalGross;
      this.orderCalculation.hotelGrandTotal = this.hotelGrandTotal;
      this.orderCalculation.tip = this.tip;
      this.orderCalculation.deliveryFee = this.deliveryFee;
      return this.orderCalculation;
    }
  };
}

@Entity("order_items")
export class OrderItem extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "order_id",
  })
  orderId: number;

  @Column({
    name: "item_id",
  })
  itemId: number;

  @Column({
    name: "item_name",
  })
  itemName: string;

  @Column()
  quantity: number;

  @Column(DECIMAL_COLUMN)
  price: number;

  @Column({
    name: "voucher_code",
  })
  voucherCode: string;

  @Column({
    name: "voucher_code_id",
  })
  voucherCodeId: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(OrderItem, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("order_item_modifiers")
export class OrderItemModifier extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "order_id",
  })
  orderId: number;

  @Column({
    name: "item_id",
  })
  itemId: number;

  @Column({
    name: "order_item_id",
  })
  orderItemId: number;

  @Column({
    name: "modifier_id",
  })
  modifierId: number;

  @Column({
    name: "modifier_name",
  })
  modifierName: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(OrderItemModifier, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("order_item_modifier_options")
export class OrderItemModifierOption extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "order_id",
  })
  orderId: number;

  @Column({
    name: "item_id",
  })
  itemId: number;

  @Column({
    name: "order_item_id",
  })
  orderItemId: number;

  @Column({
    name: "order_item_modifier_id",
  })
  orderItemModifierId: number;

  @Column({
    name: "modifier_id",
  })
  modifierId: number;

  @Column({
    name: "modifier_name",
  })
  modifierName: string;

  @Column({
    name: "modifier_option_id",
  })
  modifierOptionId: number;

  @Column({
    name: "modifier_option_name",
  })
  modifierOptionName: string;

  @Column()
  quantity: number;

  @Column(DECIMAL_COLUMN)
  price: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(OrderItemModifierOption, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("order_status")
export class OrderStatus {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "order_id",
  })
  orderId: number;

  @Column({
    name: "order_version",
  })
  orderVersion: number;

  @Column()
  status: OrderStatusEnum;

  @Column({ type: "jsonb", name: "relay_response" })
  relayResponse: { [key: string]: any };

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    name: "created_at",
  })
  public createdAt: Date;
}
