// pusher events
export const ORDER_CHANNEL = "ORDERS";
export const ORDER_CREATED_EVENT = "ORDER_CREATED";
export const SEND_CUSTOMER_ORDER_EMAIL = "SEND_CUSTOMER_ORDER_EMAIL";
export const REPLICATE_MENU_CHANNEL = "REPLICATE_MENU_CHANNEL";
export const ORDER_STATUS_UPDATED_EVENT = "ORDER_STATUS_UPDATED";
export const POST_ORDER_DETAILS_ON_SLACK = "POST_ORDER_DETAILS_ON_SLACK";

//inner server events - event emitter
export const ITEM_UPDATED_EVENT = "item.updated";
export const ITEM_DELETED_EVENT = "item.deleted";
export const MODIFIER_UPDATED_EVENT = "modifier.updated";
export const MODIFIER_DELETED_EVENT = "modifier.deleted";
export const MENU_CATEGORY_UPDATED_EVENT = "menu_category.updated";
export const MENU_CATEGORY_DELETED_EVENT = "menu_category.deleted";
export const MENU_ITEM_UPDATED_EVENT = "menu_item.updated";
export const MENU_ITEM_DELETED_EVENT = "menu_item.deleted";
export const ITEM_OUT_OF_STOCK_EVENT = "item.out_of_stock";
export const MENU_HOTEL_UPDATED_EVENT = "menu.updated";
export const HOTEL_CREATED_EVENT = "hotel.created";
export const HOTEL_UPDATED_EVENT = "hotel.updated";
export const MERCHANT_HOTEL_UNASSIGN_EVENT = "merchant.hotel.unassign";
export const MERCHANT_HOTEL_ASSIGN_EVENT = "merchant.hotel.assign";
export const MERCHANT_INACTIVE_EVENT = "merchant.inactive";
export const MEAL_PERIOD_DELETED_EVENT = "meal_period.deleted";
export const ORDER_RELAY_STATUS_UPDATED_EVENT = "ORDER_RELAY_STATUS_UPDATED";
export const REFUND_VOUCHER_BY_ORDER = "REFUND_VOUCHER_BY_ORDER";
export const ORDER_SHIPDAY_STATUS_UPDATED_EVENT =
  "ORDER_SHIPDAY_STATUS_UPDATED_EVENT";
export const CARMEL_TRIP_STATUS_UPDATE_EVENT =
  "CARMEL_TRIP_STATUS_UPDATE_EVENT";
export const CARMEL_TRIP_CANCEL_EVENT = "CARMEL_TRIP_CANCEL_EVENT";
export const REPLICATE_MENU_EVENT = "REPLICATE_MENU_EVENT";
export const CLICK_SEND_REPLY_EVENT = "CLICK_SEND_REPLY_EVENT";
