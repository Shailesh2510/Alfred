import { IsOptional, IsString } from "class-validator";
import { GENERAL_ERROR_CODE } from "./error";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import parsePhoneNumber from "libphonenumber-js";
const s3BucketMenuIdentifier = "alfredmenu-bucket";
export const DECIMAL_COLUMN = "decimal";
export const AVERAGE_ORDER_PREPARATION_TIME_MINUTES = 45;
export const RIDE_CANCEL_BEFORE_MINUTES = 60;
export const PAYMENT_REMINDER_FOR_RIDE = 120;
export const MIN_LEAD_TIME_FOR_REMINDER = 135; // 2 hours 15 minutes
export const FRIENDLY_REMINDER_FOR_RIDE = 5;
export const RELAY_DELIVERY_FEE = 5.49;
export const DEFAULT_DELIVERY_FEE_AMOUNT_USD = 5.49;
export const GX_PHONE_NUMBER = "+1 844-738-0342"; //15567889786;
export const DEFAULT_SYSTEM_TIMEZONE = "America/New_York";
export const ALLOWED_PHONE_COUNTRY = "US";

export type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: jest.Mock<{}>;
};

export interface IRestAPIResponse<T> {
  data: T[];
}

export interface IPaginationDetails {
  total: number;
  page: number;
  limit: number;
  statistics?: { [key: string]: any };
}

export class TenantImpersonateQueryParams {
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
}

export interface IRestAPIPaginationResponse<T> {
  data: T[];
  page: number;
  total: number;
}

export function RestApiResponse<T>(
  data: any,
  pagination?: IPaginationDetails
): IRestAPIResponse<T> {
  return {
    data: Array.isArray(data) ? data : [data],
    ...(pagination ?? null),
  };
}

export function STDPaginationResponse<T>(
  data: any,
  page: number,
  total: number
): IRestAPIPaginationResponse<T> {
  return {
    data,
    page: page,
    total: total,
  };
}

export function GeneralErrorResponse(message?: string, code?: number) {
  return {
    data: null,
    error: true,
    message,
    code: code ?? GENERAL_ERROR_CODE,
  };
}

export const ORDER_NUMBER_KEY_PREFIX = "order-number-merchant";
export const SCHEDULED_ORDER_NUMBER_KEY_PREFIX = "scheduled-order";
export const SCHEDULED_RIDES_ORDER_NUMBER_KEY_PREFIX = "scheduled-rides-order";
export const PAY_LATER_ORDER_NUMBER_KEY_PREFIX = "pay-later-order";

export function getOrderNumberKey(merchantId: number) {
  return `${ORDER_NUMBER_KEY_PREFIX}-${merchantId}`;
}

export function getScheduledOrderKey(orderId: number) {
  return `${SCHEDULED_ORDER_NUMBER_KEY_PREFIX}-${orderId}`;
}
export function getScheduledRidesOrderKey(orderId: number) {
  return `${SCHEDULED_RIDES_ORDER_NUMBER_KEY_PREFIX}-${orderId}`;
}

export function getPayLaterOrderKey(orderId: number) {
  return `${PAY_LATER_ORDER_NUMBER_KEY_PREFIX}-${orderId}`;
}

export function formatDate(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

export function formatDateInUSDateFormat(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day, year].join("/");
}

export const getDateWithoutTime = (dateString: string): Date => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

export function randomString(length: number) {
  return Math.round(
    Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)
  )
    .toString(36)
    .slice(1);
}

export function getHotelMenuS3Name(hotelId: string) {
  return `${s3BucketMenuIdentifier}-${hotelId}-menu`;
}

export function getImageS3Name(merchantId: number) {
  return `${s3BucketMenuIdentifier}-${merchantId}-${randomString(10)}`;
}

export function getMerchantImageS3Name(merchantId: number) {
  return `${s3BucketMenuIdentifier}-merchant-profile-${merchantId}-${randomString(
    10
  )}`;
}

export function getMerchantCoverImageS3Name(merchantId: number) {
  return `${s3BucketMenuIdentifier}-merchant-cover-profile-${merchantId}-${randomString(
    10
  )}`;
}

export function getImageUrl(imageS3Name: string) {
  return `https://${getMenuS3Bucket()}.s3.amazonaws.com/${imageS3Name}`;
}

export const toDollars = (cents) => {
  return (cents / 100).toFixed(2);
};

export function getMenuS3Bucket() {
  return `${process.env.NODE_ENV}-${s3BucketMenuIdentifier}`;
}

export function getHotelsS3Bucket() {
  return getMenuS3Bucket();
}

export function getHotelsS3BucketKey() {
  return "hotels";
}

export function getUncategorizedCategoryName() {
  return "Uncategorized";
}

export function getRelayURL() {
  return `https://api.relay.delivery/v2`;
}

export function getCloudBedsURL() {
  return `https://api.cloudbeds.com/api/v1.1`;
}

export function getRelayApiKey() {
  return process.env.RELAY_API_KEY_V2;
}

export function getAdminOrderUrl(orderId: number) {
  return process.env.NODE_ENV == "prod"
    ? `https://admin.getalfred.com/order-list/${orderId}`
    : `https://admin-${process.env.NODE_ENV}.getalfred.com/order-list/${orderId}`;
}

export function getRelayOrderUrl(orderKey: string) {
  return `https://admin.relay.delivery/#!v2/order-history/${orderKey}`;
}

export function getStripeOrderUrl(paymentIntentId: string) {
  return process.env.NODE_ENV == "prod"
    ? `https://dashboard.stripe.com/payments/${paymentIntentId}`
    : `https://dashboard.stripe.com/test/payments/${paymentIntentId}`;
}

export function getAlfredMailgunDomain() {
  return `getalfred.com `;
}

export const toCents = (amount) => {
  const str = amount?.toString();
  const int = str.split(".");

  return Number(
    Number(amount)
      .toFixed(2)
      .replace(".", "")
      .padEnd(int.length === 1 ? 3 : 3, "0")
  );
};

export const toUTC = (date: Date) => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

export const isUSPhoneNumber = (phoneNumber: string): boolean => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
  return parsedPhoneNumber?.country == ALLOWED_PHONE_COUNTRY;
};

export const getDeliveryFee = (
  isDeliveryFeeEnabled = true,
  deliveryFee: number
) => {
  if (isDeliveryFeeEnabled) {
    if (deliveryFee > 0) return deliveryFee;
    else return RELAY_DELIVERY_FEE;
  }
  return 0;
};

export const calculateDeliveryFee = (
  isDeliveryFeeEnabled = true,
  relayCanDeliverToThisAddress: boolean,
  isInHouseDelivery: boolean,
  deliveryFee: number
) => {
  if (isDeliveryFeeEnabled) {
    if (deliveryFee > 0) return deliveryFee;
    else if (relayCanDeliverToThisAddress) return RELAY_DELIVERY_FEE;
    else if (isInHouseDelivery) return DEFAULT_DELIVERY_FEE_AMOUNT_USD;
  }
  return 0;
};

export const calculateTimeDifferenceInMinutes = (
  start: string | Date | undefined,
  end: string | Date | undefined
): number => {
  if (
    !start ||
    !end ||
    isNaN(new Date(start).getTime()) ||
    isNaN(new Date(end).getTime())
  ) {
    return 0;
  }
  return (new Date(start).getTime() - new Date(end).getTime()) / 60000;
};

export const displaySlackOrderCreatedAtDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
    timeZone: "America/New_York",
  });
};

export const getTimestampDifference = (scheduledTime, currentTime) => {
  const difference = scheduledTime - currentTime;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const MS_PER_HOUR = 1000 * 60 * 60;
  const MS_PER_MINUTE = 1000 * 60;

  return {
    daysDifference: Math.floor(difference / MS_PER_DAY),
    hoursDifference: Math.floor((difference % MS_PER_DAY) / MS_PER_HOUR),
    minutesDifference: Math.floor((difference % MS_PER_HOUR) / MS_PER_MINUTE),
  };
};

export const areSimilarCoordinates = (
  coord1: { x: number; y: number },
  coord2: { x: number; y: number },
  epsilon: number = 0.0001
) => {
  return (
    Math.abs(coord1.x - coord2.x) < epsilon &&
    Math.abs(coord1.y - coord2.y) < epsilon
  );
};
