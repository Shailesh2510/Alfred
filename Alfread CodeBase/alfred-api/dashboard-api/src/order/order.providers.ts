import { MERCHANT_HOTEL_REPOSITORY, ORDER_CALCULATION_REPOSITORY, ORDER_ITEM_MODIFIER_OPTIONS_REPOSITORY, ORDER_ITEM_MODIFIER_REPOSITORY, ORDER_ITEM_REPOSITORY, ORDER_REPOSITORY, ORDER_STATUS_REPOSITORY, PAYMENT_LOG_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { DataSource } from "typeorm";
import { Order, OrderCalculation, OrderItem, OrderItemModifier, OrderItemModifierOption, OrderStatus } from "../../database/entities/order.entity";
import { MerchantHotel } from "../../database/entities/merchant.entity";
import { PaymentLog } from "database/entities/payment_log.entity";

export const orderProviders = [
  {
    provide: ORDER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ORDER_ITEM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderItem),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ORDER_ITEM_MODIFIER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderItemModifier),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ORDER_ITEM_MODIFIER_OPTIONS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderItemModifierOption),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ORDER_STATUS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderStatus),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ORDER_CALCULATION_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderCalculation),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MERCHANT_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MerchantHotel),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: PAYMENT_LOG_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentLog),
    inject: [PG_DATA_SOURCE],
  },
];
