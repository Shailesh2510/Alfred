export type OrderStatusType =
  | "INITIATED"
  | "SCHEDULED"
  | "PENDING"
  | "CONFIRMED"
  | "PREPARATION"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export const ORDER_STATUS: any = {
  INITIATED: { value: "INITIATED", label: "Initiated" },
  SCHEDULED: { value: "SCHEDULED", label: "Scheduled" },
  PENDING: { value: "PENDING", label: "Pending" },
  CONFIRMED: { value: "CONFIRMED", label: "Confirmed" },
  PREPARATION: { value: "PREPARATION", label: "Preparation" },
  IN_DELIVERY: { value: "IN_DELIVERY", label: "In Delivery" },
  DELIVERED: { value: "DELIVERED", label: "Delivered" },
  CANCELED: { value: "CANCELED", label: "Canceled" },
};

export const MERCHANT_ORDER_STATUS: any = {
  SCHEDULED: { value: "SCHEDULED", label: "Scheduled" },
  PENDING: { value: "PENDING", label: "Pending" },
  CONFIRMED: { value: "CONFIRMED", label: "Confirmed" },
  PREPARATION: { value: "PREPARATION", label: "Preparation" },
  IN_DELIVERY: { value: "IN_DELIVERY", label: "In Delivery" },
  DELIVERED: { value: "DELIVERED", label: "Delivered" },
  CANCELED: { value: "CANCELED", label: "Canceled" },
};

export const PAYMENT_METHOD: any = {
  ROOM_CHARGE: { value: "ROOM_CHARGE", label: "Room charge" },
  CREDIT_CARD: { value: "CREDIT_CARD", label: "Credit card" },
  PAY_LATER: { value: "PAY_LATER", label: "Pay Later" },
};

export const ADDRESS_LABEL: any = {
  DROP_OFF_ADDRESS: { value: "DROP_OFF_ADDRESS", label: "Dropoff Address" },
  PICK_UP_ADDRESS: { value: "PICK_UP_ADDRESS", label: "Pickup Address" },
};

export const LOCATION_LABEL: any = {
  DROP_OFF_LOCATION: { value: "DROP_OFF_LOCATION", label: "Dropoff Location" },
  PICK_UP_LOCATION: { value: "PICK_UP_LOCATION", label: "Pickup Location" },
};

export const VOUCHER_TYPES: any = {
  DISCOUNT: { value: "DISCOUNT", label: "DISCOUNT" },
  PER_DIEM: { value: "PER_DIEM", label: "PER DIEM" },
  PRE_FIXE: { value: "PRE_FIXE", label: "PRE FIXE" },
};

export const DISCOUNT_VOUCHER_TYPE: any = {
  FIXED: { value: "FIXED", label: "Fixed" },
  PERCENTAGE: { value: "PERCENTAGE", label: "Percentage" },
};

export const USER_TYPES: any = {
  TENANT_USER: { value: "TENANT_USER", label: "Admin" },
  HOTEL_USER: { value: "HOTEL_USER", label: "Hotel" },
  MERCHANT_USER: { value: "MERCHANT_USER", label: "Merchant" },
};

export const ROLE_TYPES: any = {
  TENANT_ROLE: { value: "TENANT_ROLE", label: "Admin" },
  HOTEL_ROLE: { value: "HOTEL_ROLE", label: "Hotel" },
  MERCHANT_ROLE: { value: "MERCHANT_ROLE", label: "Merchant" },
};

export const FILTER_SIZE = "md";
export const ICON_SIZE = 22;

export const DEFAULT_DELIVERY_FEE_AMOUNT_USD = 5.49;

export const SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES = 50;
export const RIDE_DIFFERENCE_TIME_IN_MINUTES = 5;
export const PAY_LATER_DIFFERENCE_TIME_IN_MINUTES = 90;
export const CATERING_ORDER_DIFFERENCE_TIME_IN_MINUTES = 480; // 8 hours

export const ORDER_CHANNEL = "ORDERS";
export const ORDER_CREATED_EVENT = "ORDER_CREATED";
export const ORDER_CANCELED_EVENT = "ORDER_CANCELED";
export const ORDER_STATUS_UPDATED_EVENT = "ORDER_STATUS_UPDATED";
export const REPLICATE_MENU_EVENT = "REPLICATE_MENU_EVENT";
export const REPLICATE_MENU_CHANNEL = "REPLICATE_MENU_CHANNEL";

export const MERCHANT_TYPE_ROOM_SERVICE = "ROOM_SERVICE";
export const MERCHANT_TYPE_RIDES = "RIDES";

export const PHONE_VALIDATION_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
export const EMAIL_VALIDATION_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const CANCEL_ORDER_DROPDOWN_OPTIONS = [{ label: "I'm running late", value: "running late" }];

export const AWS_DEFAULT_REGION = "us-east-1";

export const airportCoordinates: {
  [key: string]: { latitude: number; longitude: number };
} = {
  JFK: { latitude: 40.6413, longitude: -73.7781 },
  EWR: { latitude: 40.6895, longitude: -74.1745 },
  LGA: { latitude: 40.7769, longitude: -73.874 },
};
