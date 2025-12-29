import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  Order,
  OrderCalculation,
  OrderItem,
  OrderItemModifier,
  OrderItemModifierOption,
  OrderStatus,
  OrderStatusEnum,
  OrderType,
} from "../../database/entities/order.entity";
import { getPaginationData } from "../../pagination";
import {
  DataSource,
  In,
  Not,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import {
  ORDER_CALCULATION_REPOSITORY,
  ORDER_ITEM_MODIFIER_OPTIONS_REPOSITORY,
  ORDER_ITEM_MODIFIER_REPOSITORY,
  ORDER_ITEM_REPOSITORY,
  ORDER_REPOSITORY,
  ORDER_STATUS_REPOSITORY,
  PAYMENT_LOG_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import {
  CreateOrderDTO,
  CreateOrderItemDTO,
  CreateOrderItemModifierDTO,
} from "./dto/create-order.dto";
import { OrderCalculationService } from "./order-calculation.service";
import { VoucherCodeOrderVM } from "../../src/voucher_code/vm/voucher-code.vm";
import { Hotel } from "../../database/entities/hotel.entity";
import { VoucherCode } from "../../database/entities/voucher_code.entity";
import { HotelService } from "../../src/hotel/hotel.service";
import { VoucherCodeService } from "../../src/voucher_code/voucher_code.service";
import { ItemService } from "src/item/item.service";
import { Item } from "database/entities/item.entity";
import { ModifierService } from "src/modifier/modifier.service";
import {
  IOrderCalculationVoucher,
  IOrderItem,
  IOrderModifier,
  PaymentType,
} from "./calculation";
import {
  OrderItemModifierOptionVM,
  OrderItemModifierVM,
  OrderItemVM,
} from "./vm/order-item.vm";
import { PusherService } from "../../src/notification/pusher.service";
import {
  CARMEL_TRIP_CANCEL_EVENT,
  ORDER_CHANNEL,
  ORDER_CREATED_EVENT,
  ORDER_STATUS_UPDATED_EVENT,
} from "../../events";
import {
  areSimilarCoordinates,
  DEFAULT_SYSTEM_TIMEZONE,
  formatDate,
  getOrderNumberKey,
  getPayLaterOrderKey,
  getRelayOrderUrl,
  getScheduledOrderKey,
  getScheduledRidesOrderKey,
  getStripeOrderUrl,
} from "helpers";
import { UpdateOrderStatusDTO } from "./dto/update-order-status.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CancelOrderDTO } from "./dto/cancel-order.dto";
import { MerchantService } from "../merchant/merchant.service";
import { BaseService } from "src/base.service";
import { OrderListFilters, OrderCommissionListFilters } from "./dto/order.dto";
import { MealPeriodService } from "src/meal_period/meal_period.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentLog } from "database/entities/payment_log.entity";
import { VoucherProgramType } from "database/entities/voucher_program.entity";
import Decimal from "decimal.js-light";
import { CityService } from "src/city/city.service";
import { isWithInOverNightTimeRange } from "src/utils/utils";
import { ShipdayService } from "src/shipday/shipday.service";
import { AppConfigService } from "src/aws/appConfig.service";
import { MerchantType } from "database/enums/merchantType";
import { RideCalculationService } from "./ride-calculation.service";
import { RelayService } from "src/relay/relay.service";
import { HTTPService } from "src/http/http.service";
import { getTimezoneOffset } from "date-fns-tz";

// we need to get a full list of orders with pagination, and should include filters
// we need to get orders list for a specific hotel
// we need to get orders list for a specific merchant
// we need to get order details

// we need to create an order
// we need to update an order - removed
// we need to overwrite/change the status of an order
// we need to refund an order
// we need to confirm an order
// we need to prepare an order
// we need to pickup an order
// we need to deliver an order

@Injectable()
export class OrderService extends BaseService<Order, CreateOrderDTO, {}> {
  @Inject(HTTPService)
  private readonly httpService: HTTPService;
  @Inject(ORDER_REPOSITORY)
  protected _repository: Repository<Order>;

  logger = new Logger();

  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(ORDER_STATUS_REPOSITORY)
  private readonly orderStatusRepository: Repository<OrderStatus>;
  @Inject(ORDER_ITEM_REPOSITORY)
  private readonly orderItemRepository: Repository<OrderItem>;
  @Inject(ORDER_ITEM_MODIFIER_REPOSITORY)
  private readonly orderItemModifierRepository: Repository<OrderItemModifier>;
  @Inject(ORDER_ITEM_MODIFIER_OPTIONS_REPOSITORY)
  private readonly orderItemModifierOptionsRepository: Repository<OrderItemModifierOption>;
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(VoucherCodeService)
  private readonly voucherCodeService: VoucherCodeService;
  @Inject(ItemService)
  private readonly itemService: ItemService;
  @Inject(ModifierService)
  private readonly modifierService: ModifierService;
  @Inject(PusherService)
  private readonly pusherService: PusherService;
  @Inject(AppConfigService)
  private readonly appConfigService: AppConfigService;
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;
  @Inject(MerchantService)
  private readonly merchantService: MerchantService;
  @Inject(MealPeriodService)
  private readonly mealPeriodService: MealPeriodService;
  @Inject(CityService)
  private readonly cityService: CityService;
  @Inject(ShipdayService)
  private readonly shipdayService: ShipdayService;
  @Inject(RelayService)
  private readonly relayService: RelayService;
  @Inject(PAYMENT_LOG_REPOSITORY)
  private readonly paymentLogRepository: Repository<PaymentLog>;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2;
  @Inject(ORDER_CALCULATION_REPOSITORY)
  private readonly orderCalculationRepository: Repository<OrderCalculation>;

  private readonly orderCalculationService = new OrderCalculationService();

  private readonly rideCalculationService = new RideCalculationService();

  private getOrderFilters(
    qb: SelectQueryBuilder<ObjectLiteral>,
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    if (hotelId) {
      qb = qb
        .andWhere("o.hotel_id = :hotelId")
        .setParameter("hotelId", hotelId);
    }
    if (merchantId) {
      qb = qb
        .andWhere("o.merchant_id = :merchantId")
        .setParameter("merchantId", merchantId);
    }
    if (filters?.date) {
      qb = qb
        .andWhere("date(o.order_date) = :date")
        .setParameter("date", filters.date);
    }
    if (filters?.fromDate) {
      qb = qb
        .andWhere(
          `CAST((o.order_date AT TIME ZONE '${DEFAULT_SYSTEM_TIMEZONE}') AS date) >= :fromDate`
        )
        .setParameter("fromDate", filters.fromDate);
    }
    if (filters?.toDate) {
      qb = qb
        .andWhere(
          `CAST((o.order_date AT TIME ZONE '${DEFAULT_SYSTEM_TIMEZONE}') AS date) <= :toDate`
        )
        .setParameter("toDate", filters.toDate);
    }
    if (filters?.status) {
      qb = qb
        .andWhere("LOWER(CAST(o.status AS TEXT)) = LOWER(:status)")
        .setParameter("status", `${filters.status}`);
    }
    if (filters?.clientName) {
      qb = qb
        .andWhere("lower(o.client_name) like :clientName")
        .setParameter("clientName", `${filters.clientName.toLowerCase()}%`);
    }
    if (filters?.clientNumber) {
      qb = qb
        .andWhere("o.client_number like :clientNumber")
        .setParameter("clientNumber", `${filters.clientNumber}%`);
    }
    if (filters?.clientEmail) {
      qb = qb
        .andWhere("lower(o.client_email) like :clientEmail")
        .setParameter("clientEmail", `${filters.clientEmail.toLowerCase()}%`);
    }
    if (filters?.hotelId) {
      qb = qb
        .andWhere("o.hotel_id = :hotelId")
        .setParameter("hotelId", filters.hotelId);
    }
    if (filters?.merchantId) {
      qb = qb
        .andWhere("o.merchant_id = :merchantId")
        .setParameter("merchantId", filters.merchantId);
    }
    if (filters?.orderType) {
      qb = qb
        .andWhere("o.order_type = :orderType")
        .setParameter("orderType", filters.orderType);
    }
    if (filters?.mealPeriodId) {
      qb = qb
        .andWhere("o.meal_period_id = :mealPeriodId")
        .setParameter("mealPeriodId", filters.mealPeriodId);
    }
    if (filters?.orderDate) {
      qb = qb
        .andWhere("o.order_date = :orderDate")
        .setParameter("orderDate", filters.orderDate);
    }
    if (filters?.id) {
      qb = qb.andWhere("o.id = :id").setParameter("id", filters.id);
    }
    if (filters?.nonce) {
      qb = qb
        .andWhere("o.nonce = :nonce")
        .setParameter("nonce", filters?.nonce);
    }
    if (filters?.roomNumber) {
      qb = qb
        .andWhere("LOWER(o.room_number) LIKE LOWER(:roomNumber)")
        .setParameter("roomNumber", `%${filters?.roomNumber}%`);
    }

    if (filters?.voucherCode || filters?.voucherType) {
      if (filters.voucherCode) {
        qb = qb
          .andWhere("vc.code LIKE :voucherCode")
          .setParameter("voucherCode", `%${filters.voucherCode}%`);
      }
      if (filters.voucherType) {
        qb = qb
          .andWhere("vp.type = :voucherType")
          .setParameter("voucherType", filters.voucherType);
      }
    }
    return qb;
  }

  private async getActiveOrderListQueryBuilder(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let selectColumns = `
    o.*,
    ${isExport ? "o.updated_at as delivered_on," : ""}
    h.id as hotel_id,
    h.name as hotel_name,
    h.code as hotel_code,
    h.web_code as hotel_web_code,
    h._id as hotel_uuid,
    h.address_number as hotel_address_number,
    h.address_street as hotel_address_street,
    h.address_town as hotel_address_town,
    h.address_zip_code as hotel_address_zip_code,
    h.has_third_party_delivery as hotel_has_third_party_delivery,
    m.id as merchant_id,
    m.name as merchant_name,
    m.has_third_party_delivery as merchant_has_third_party_delivery,
    m.address_number as merchant_address_number,
    m.address_street as merchant_address_street,
    m.address_town as merchant_address_town,
    m.address_zip_code as merchant_address_zip_code,
    m.color as merchant_color,
    m.merchant_type as merchant_type,
    mp.name as meal_period_name,
    c.timezone,
    vp.payer_percentage as payer_percentage,
    vp.total_amount as total_amount,
    vp.payer,
    vp.type,
    a.ambassador_name as ambassador_name,
    CASE
      WHEN o.payment_status = 'succeeded' THEN true
      ELSE false
    END as is_paid
  `;

    let qb = this.connection
      .createQueryBuilder()
      .select(selectColumns)
      .from("orders", "o")
      .innerJoin("hotels", "h", "h.id = o.hotel_id")
      .innerJoin("merchants", "m", "m.id = o.merchant_id")
      .innerJoin("meal_period", "mp", "mp.id = o.meal_period_id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .leftJoin("voucher_codes", "vc", "vc.id = o.voucher_code_id")
      .leftJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .leftJoin("referrals", "a", "a.id = o.referral_id")
      .orderBy("o.updated_at", "DESC")
      .addOrderBy(`o.order_number`, "DESC");

    if (isExport) {
      if (!filters?.status) {
        filters.status = OrderStatusEnum.DELIVERED;
      }
    }

    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    return qb;
  }

  private getOrderListQueryBuilder(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let selectColumns = `
        o.*,
        ${isExport ? "o.updated_at as delivered_on," : ""}
        h.id as hotel_id,
        h.name as hotel_name,
        h.code as hotel_code,
        h.web_code as hotel_web_code,
        h._id as hotel_uuid,
        h.address_number as hotel_address_number,
        h.address_street as hotel_address_street,
        h.address_town as hotel_address_town,
        h.address_zip_code as hotel_address_zip_code,
        h.has_third_party_delivery as hotel_has_third_party_delivery,
        m.id as merchant_id,
        m.name as merchant_name,
        m.has_third_party_delivery as merchant_has_third_party_delivery,
        m.address_number as merchant_address_number,
        m.address_street as merchant_address_street,
        m.address_town as merchant_address_town,
        m.address_zip_code as merchant_address_zip_code,
        m.color as merchant_color,
        m.merchant_type as merchant_type,
        mp.name as meal_period_name,
        c.timezone,
        vp.payer_percentage as payer_percentage,
        vp.total_amount as total_amount,
        vp.payer,
        vp.type
      `;
    let qb = this.connection
      .createQueryBuilder()
      .select(selectColumns)
      .from("orders", "o")
      .innerJoin("hotels", "h", "h.id = o.hotel_id")
      .innerJoin("merchants", "m", "m.id = o.merchant_id")
      .innerJoin("meal_period", "mp", "mp.id = o.meal_period_id")
      .innerJoin("cities", "c", "c.id = h.city_id")

      .leftJoin("voucher_codes", "vc", "vc.id = o.voucher_code_id")
      .leftJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .orderBy("o.updated_at", "DESC")
      .addOrderBy(`o.order_number`, "DESC");

    if (isExport) {
      if (!filters?.status) {
        filters.status = OrderStatusEnum.DELIVERED;
      }
    }
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    return qb;
  }

  // Merchant Order List Query Builder excluding initiated orders
  private getMerchantOrderListQueryBuilder(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let selectColumns = `
      o.*,
      ${isExport ? "o.updated_at as delivered_on," : ""}
      h.id as hotel_id,
      h.name as hotel_name,
      h.code as hotel_code,
      h.web_code as hotel_web_code,
      h._id as hotel_uuid,
      h.address_number as hotel_address_number,
      h.address_street as hotel_address_street,
      h.address_town as hotel_address_town,
      h.address_zip_code as hotel_address_zip_code,
      h.has_third_party_delivery as hotel_has_third_party_delivery,
      m.id as merchant_id,
      m.name as merchant_name,
      m.has_third_party_delivery as merchant_has_third_party_delivery,
      m.address_number as merchant_address_number,
      m.address_street as merchant_address_street,
      m.address_town as merchant_address_town,
      m.address_zip_code as merchant_address_zip_code,
      m.color as merchant_color,
      mp.name as meal_period_name,
      c.timezone,
      vp.payer_percentage as payer_percentage,
      vp.total_amount as total_amount,
      vp.payer,
      vp.type
    `;
    let qb = this.connection
      .createQueryBuilder()
      .select(selectColumns)
      .from("orders", "o")
      .innerJoin("hotels", "h", "h.id = o.hotel_id")
      .innerJoin("merchants", "m", "m.id = o.merchant_id")
      .innerJoin("meal_period", "mp", "mp.id = o.meal_period_id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .leftJoin("voucher_codes", "vc", "vc.id = o.voucher_code_id")
      .leftJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .andWhere("CAST(o.status AS text) != :excludeStatus")
      .setParameter("excludeStatus", OrderStatusEnum.INITIATED)
      .orderBy("o.updated_at", "DESC")
      .addOrderBy(`o.order_number`, "DESC");

    if (isExport) {
      if (!filters?.status) {
        filters.status = OrderStatusEnum.DELIVERED;
      }
    }
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    return qb;
  }

  private async getItemsWithModifiersByMenu(menuId: number) {
    return await this.connection
      .createQueryBuilder()
      .select(
        `mi.item_id, im.modifier_id, i.merchant_id, mi.price, mi.new_price`
      )
      .from("menu_item", "mi")
      .leftJoin("item_modifier", "im", "mi.item_id = im.item_id")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .where("mi.menu_id = :menuId")
      .setParameter("menuId", menuId)
      .getRawMany();
  }

  private async validateMerchantForMenu(
    menuId: number,
    mealPeriodId: number,
    itemIds: number[]
  ) {
    const data = await this.connection
      .createQueryBuilder()
      .select(`mi.item_id, i.merchant_id`)
      .from("menu_item", "mi")
      .innerJoin("items", "i", "i.id = mi.item_id")
      .innerJoin("menu_category", "mc", "mi.menu_category_id = mc.id")
      .where("mi.menu_id = :menuId")
      .andWhere("mc.meal_period_id = :mealPeriodId")
      .andWhere("i.id in (:...itemIds)")
      .setParameter("menuId", menuId)
      .setParameter("mealPeriodId", mealPeriodId)
      .setParameter("itemIds", itemIds)
      .getRawMany();
    const merchantMap = {};
    data?.forEach((item) => {
      merchantMap[item.merchant_id] = item.merchant_id;
    });

    if (Object.keys(merchantMap).length == 0) {
      throw new HttpException(
        `No merchant associated with this menu`,
        HttpStatus.CONFLICT
      );
    }
    if (Object.keys(merchantMap).length > 1) {
      throw new HttpException(
        `Inconsistency between items and merchants`,
        HttpStatus.CONFLICT
      );
    }
    return +Object.keys(merchantMap)[0];
  }

  private async getVoucherCodes(hotelId: number, voucherCodeIds: number[]) {
    const data = await this.connection
      .createQueryBuilder()
      .select(
        `
      vc.*,
      vp.type as voucher_program_type,
      vp.name as voucher_program_name,
      vc.amount_used,
      vp.total_amount,
      vp.payer_percentage,
      vp.amount_type,
      json_agg(json_build_object(
        'id', vpr.id,
        'meal_period_id', vpr.meal_period_id,
        'quantity', vpr.quantity,
        'max_price', vpr.max_price,
        'menu_category_ids', vpr.menu_category_ids
      )) as rules
    `
      )
      .from("voucher_codes", "vc")
      .innerJoin("voucher_programs", "vp", "vc.voucher_program_id = vp.id")
      .innerJoin(
        "voucher_program_hotel",
        "vph",
        "vph.voucher_program_id = vp.id"
      )
      .leftJoin(
        "voucher_program_rules",
        "vpr",
        "vpr.voucher_program_id = vp.id"
      )
      .where("vph.hotel_id = :hotelId")
      // .andWhere('vc.claimed_date is null')
      .andWhere("vc.id in (:...voucherCodeIds)")
      .setParameter("hotelId", hotelId)
      .setParameter("voucherCodeIds", voucherCodeIds)
      .groupBy("vc.id, vp.id")
      .getRawMany();

    for (let i = 0; i < data.length; i++) {
      const voucherCode = data[i];
      if (voucherCode.voucher_program_type !== VoucherProgramType.PER_DIEM) {
        if (voucherCode.claimed_date != null) {
          throw new Error("Voucher is already claimed");
        }
      } else {
        const value =
          this.voucherCodeService.validatePerdiemVoucher(voucherCode);
        if (value == null) {
          throw new Error("Perdiem voucher is already claimed");
        }
      }
    }
    console.log("get-voucher-codes-data: ", data);
    if (data.length <= 0) {
      throw new HttpException(
        "@getVoucherCodes: Invalid voucher code",
        HttpStatus.BAD_REQUEST
      );
    }
    return new VoucherCodeOrderVM(data).build();
  }

  private async validateItems(menuId: number, items: CreateOrderItemDTO[]) {
    const itemModifiers = await this.getItemsWithModifiersByMenu(menuId);
    const itemModifierMap = {};
    const modifiersMap = {};
    itemModifiers.forEach((itemModifier) => {
      if (itemModifierMap[itemModifier.item_id]) {
        if (itemModifier.modifier_id)
          itemModifierMap[itemModifier.item_id].push(itemModifier.modifier_id);
      } else {
        if (itemModifier.modifier_id)
          itemModifierMap[itemModifier.item_id] = [itemModifier.modifier_id];
        else itemModifierMap[itemModifier.item_id] = [];
      }
    });
    console.log("itemModifierMap: ", itemModifierMap);
    items.forEach((item) => {
      if (!itemModifierMap[item.id]) {
        throw new HttpException(
          "Item does not exist on hotel menu",
          HttpStatus.BAD_REQUEST
        );
      }
      const modifierIds = itemModifierMap[item.id];
      item.modifiers?.forEach((modifier: CreateOrderItemModifierDTO) => {
        if (!modifierIds.includes(modifier.id)) {
          throw new HttpException(
            `Modifier ${modifier.id} does not belong to item ${item.id}`,
            HttpStatus.BAD_REQUEST
          );
        }
      });
    });
  }

  private async validateVouchers(dto: CreateOrderDTO) {
    const orderItemVoucherCodeIds = dto.items
      .map((item) => item.voucherCodeId)
      .filter((e) => e);

    if (dto.voucherCodeId && orderItemVoucherCodeIds.length > 0) {
      throw new HttpException(
        `Not allowed to have order vouchers mixed with item vouchers`,
        HttpStatus.BAD_REQUEST
      );
    }
    let voucherObject = {
      orderVoucher: null,
      prefixeVouchers: [],
    };

    let voucherCodes = [];
    if (dto.voucherCodeId) {
      voucherCodes = await this.getVoucherCodes(dto.hotelId, [
        dto.voucherCodeId,
      ]);
      if (voucherCodes.length != 1) {
        throw new HttpException(`Invalid voucher code`, HttpStatus.BAD_REQUEST);
      }
      console.log(`voucherCodes-log: `, voucherCodes);
      voucherObject.orderVoucher = {
        ...voucherCodes[0],
      };
    }
    if (orderItemVoucherCodeIds.length) {
      voucherCodes = await this.getVoucherCodes(
        dto.hotelId,
        orderItemVoucherCodeIds
      );
      if (voucherCodes.length !== orderItemVoucherCodeIds.length) {
        throw new HttpException(
          `Invalid voucher codes`,
          HttpStatus.BAD_REQUEST
        );
      }
      for (let i = 0; i < voucherCodes.length; i++) {
        if (voucherCodes[i].type != VoucherProgramType.PRE_FIXE) {
          throw new HttpException(
            `Order items can have only PRE_FIXE vouchers`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
      voucherObject.prefixeVouchers = voucherCodes;
    }
    return voucherObject;
  }

  private async constructOrderObject(
    dto: CreateOrderDTO,
    status: OrderStatusEnum,
    hotel: Hotel,
    merchantId: number,
    voucherCode: VoucherCode,
    orderCalculation: OrderCalculation,
    appliedVoucherAmount: number
  ) {
    const orderNumber = await this.getOrderNumber(merchantId);
    return new Order.Builder()
      .setClientName(dto.clientName)
      .setClientNumber(dto.clientNumber)
      .setClientEmail(dto.clientEmail)
      .setHotelId(hotel.id)
      .setMerchantId(merchantId)
      .setOrderNumber(orderNumber)
      .setOrderType(dto.orderType)
      .setStatus(status)
      .setVoucherCode(voucherCode?.code)
      .setVoucherCodeId(voucherCode?.id)
      .setReferralId(dto.referralId)
      .setReceiptAmount(orderCalculation.receiptAmount)
      .setTotalNet(orderCalculation.totalNet)
      .setTotalGross(orderCalculation.totalGross)
      .setTaxAmount(orderCalculation.taxAmount)
      .setGrandTotal(orderCalculation.grandTotal)
      .setHotelTotalNet(orderCalculation.hotelTotalNet)
      .setHotelTotalGross(orderCalculation.hotelTotalGross)
      .setHotelTaxAmount(orderCalculation.hotelTaxAmount)
      .setHotelGrandTotal(orderCalculation.hotelGrandTotal)
      .setVoucherPrice(orderCalculation.voucherPrice)
      .setAppliedVoucherAmount(appliedVoucherAmount)
      .setRefundAmount(orderCalculation.refundAmount)
      .setTip(orderCalculation.tip)
      .setDeliveryFee(orderCalculation.deliveryFee)
      .setScheduledDate(dto.scheduledDate)
      .setComment(dto.comment)
      .setRoomNumber(dto.roomNumber)
      .setMealPeriodId(dto.mealPeriodId)
      .setOrderDate(new Date())
      .setNumberOfCutleries(
        dto.numberOfCutleries ? Number(dto.numberOfCutleries) : null
      )
      .setHasAlcohol(Boolean(dto.hasAlcohol))
      .setIsCatering(Boolean(dto.isCatering))
      .build();
  }

  private async getOrderNumber(merchantId: number): Promise<number> {
    const orderNumberKey = getOrderNumberKey(merchantId);
    let orderNumber: number = 1;
    //possible solution in case redis fails would be to check in-memory cache for order number
    try {
      orderNumber = await this.cacheManager.get(orderNumberKey);
    } catch (err) {
      this.logger.error(`[err@cacheManager.get]: ${err.message}`);
    }
    if (!orderNumber) {
      orderNumber = 1;
    } else {
      orderNumber += 1;
    }
    try {
      await this.cacheManager.set(orderNumberKey, orderNumber);
    } catch (err) {
      this.logger.error(`[err@cacheManager.set]: ${err.message}`);
    }
    return +orderNumber;
  }

  private async constructOrderItemsForCalculation(
    dtoItems: CreateOrderItemDTO[],
    merchantId: number,
    menuId: number
  ) {
    const itemIds = [];
    const modifierIdsMap = {};
    const dtoItemsMap = {};
    dtoItems.map((item) => {
      itemIds.push(item.id);
      item.modifiers?.forEach((modifier) => {
        modifierIdsMap[modifier.id] = modifier.id;
      });
      dtoItemsMap[item.id] = item;
    });
    const items = await this.itemService.findWithMenuItem(
      itemIds,
      merchantId,
      menuId
    );
    const itemsMap = {};
    items.forEach((item: Item) => {
      itemsMap[item.id] = item;
    });

    const voucherCodesMap = {};
    dtoItems.forEach((item) =>
      +item.voucherCodeId ? (voucherCodesMap[+item.voucherCodeId] = true) : null
    );

    const voucherCodes = await this.voucherCodeService.findById(
      Object.keys(voucherCodesMap).map((id) => +id),
      true
    );
    if (voucherCodes.length !== Object.keys(voucherCodesMap).length) {
      throw new HttpException("Voucher inconsistency", HttpStatus.BAD_REQUEST);
    }

    voucherCodes.forEach((voucherCode) => {
      voucherCodesMap[voucherCode.id] = voucherCode.code;
    });

    const modifiers = await this.modifierService.findByIdWithOptions(
      Object.keys(modifierIdsMap).map((e) => +e)
    );
    const modifiersMap = {};
    modifiers.forEach((modifier) => {
      modifiersMap[modifier.id] = { ...modifier };
      modifiersMap[modifier.id].options = {};
      modifier.options.forEach((modifierOption) => {
        modifiersMap[modifier.id].options[modifierOption.id] = modifierOption;
      });
    });

    const orderItems: IOrderItem[] = [];
    dtoItems.forEach((item: CreateOrderItemDTO) => {
      const itemObj: IOrderItem = {
        id: itemsMap[item.id].id,
        quantity: item.quantity,
        price: itemsMap[item.id].new_price
          ? itemsMap[item.id].new_price
          : itemsMap[item.id].price,
        modifiers: [],
        codeId: dtoItemsMap[item.id].voucherCodeId ?? null,
        ruleId: null,
        menuCategoryId: itemsMap[item.id].menu_category_id,
      };
      item.modifiers?.forEach((modifier) => {
        const modifierObj: IOrderModifier = {
          id: modifiersMap[modifier.id].id,
          options: [],
        };
        modifier.options?.forEach((modifierOption) => {
          const modifierOptionObj = {
            ...modifiersMap[modifier.id].options[modifierOption.id],
            quantity: 1, //only one is allowed by default and cant be modified
          };
          modifierObj.options.push(modifierOptionObj);
        });
        itemObj.modifiers.push(modifierObj);
      });
      orderItems.push(itemObj);
    });

    return orderItems;
  }

  private async saveOrderItems(
    orderId: number,
    dtoItems: CreateOrderItemDTO[],
    merchantId: number,
    menuId: number
  ) {
    const itemIds = [];
    const modifierIdsMap = {};
    dtoItems.map((item) => {
      itemIds.push(item.id);
      item.modifiers?.forEach((modifier) => {
        modifierIdsMap[modifier.id] = modifier.id;
      });
    });
    const items = await this.itemService.findWithMenuItem(
      itemIds,
      merchantId,
      menuId
    );
    const itemMap = {};
    items.forEach((item: Item) => {
      itemMap[item.id] = item;
    });

    const voucherCodesMap = {};
    dtoItems.forEach((item) =>
      +item.voucherCodeId ? (voucherCodesMap[+item.voucherCodeId] = true) : null
    );

    const voucherCodes = await this.voucherCodeService.findById(
      Object.keys(voucherCodesMap).map((id) => +id),
      true
    );
    if (voucherCodes.length !== Object.keys(voucherCodesMap).length) {
      throw new HttpException("Voucher inconsistency", HttpStatus.BAD_REQUEST);
    }

    voucherCodes.forEach((voucherCode) => {
      voucherCodesMap[voucherCode.id] = voucherCode.code;
    });

    const modifiers = await this.modifierService.findByIdWithOptions(
      Object.keys(modifierIdsMap).map((e) => +e)
    );
    const modifierMap = {};
    const modifierOptionsMap = {};
    modifiers.forEach((modifier) => {
      modifierMap[modifier.id] = modifier;
      modifier.options.forEach((modifierOption) => {
        modifierOptionsMap[modifierOption.id] = modifierOption;
      });
    });

    for await (const item of dtoItems) {
      const orderItemObject = {
        itemId: item.id,
        itemName: itemMap[item.id].name,
        quantity: item.quantity,
        price: itemMap[item.id].new_price ?? itemMap[item.id].price,
        orderId,
        voucherCode: voucherCodesMap[item.voucherCodeId],
        voucherCodeId: item.voucherCodeId,
      };
      const orderItemEntity = await this.orderItemRepository.save(
        orderItemObject
      );
      const orderItemModifierOptions = [];
      if (item.modifiers?.length) {
        for await (const modifier of item.modifiers) {
          const orderItemModifier = {
            itemId: item.id,
            modifierId: modifier.id,
            modifierName: modifierMap[modifier.id].name,
            orderId,
            orderItemId: orderItemEntity.id,
          };
          const orderItemModifierEntity =
            await this.orderItemModifierRepository.save(orderItemModifier);
          modifier.options?.forEach((modifierOption) => {
            orderItemModifierOptions.push({
              ...orderItemModifier,
              orderItemId: orderItemEntity.id,
              orderItemModifierId: orderItemModifierEntity.id,
              modifierOptionId: modifierOption.id,
              modifierOptionName: modifierOptionsMap[modifierOption.id].name,
              price: modifierOptionsMap[modifierOption.id].price,
              quantity: 1, // default quantity per modifier-cannot be modified
            });
          });
        }
      }
      await this.orderItemModifierOptionsRepository.insert(
        orderItemModifierOptions
      );
    }
  }

  async validateVoucherRules(
    prefixeVouchers: IOrderCalculationVoucher[],
    items: IOrderItem[]
  ) {
    const codesVouchersMap = {};

    if (prefixeVouchers.length == 0) {
      return;
    }

    prefixeVouchers?.forEach((prefixeVoucher) => {
      const voucherCodeId = prefixeVoucher.id;
      codesVouchersMap[voucherCodeId] = prefixeVoucher;
    });

    const ruleCountMap = {};
    items.forEach((item, idx) => {
      if (item.codeId) {
        const voucherCode = codesVouchersMap[item.codeId];

        voucherCode.rules.forEach((rule) => {
          if (
            item.price <= rule.maxPrice &&
            rule.menuCategoryIds.includes(item.menuCategoryId)
          ) {
            items[idx].ruleId = rule.id;
            if (ruleCountMap[rule.id]) {
              ruleCountMap[rule.id]++;
            } else {
              ruleCountMap[rule.id] = 1;
            }
          }
          if (ruleCountMap[rule.id] > rule.quantity) {
            //throw error about rule quantity
            this.logger.log(`ruleCountMap[rule.id]: `, ruleCountMap[rule.id]);
            this.logger.log(`rule: `, rule);
            throw new HttpException(
              `Voucher rule quantity exceeded`,
              HttpStatus.CONFLICT
            );
          }
        });
        if (items[idx].ruleId == null) {
          //throw error couldnt match to a rule
          throw new HttpException(
            `Match item ${items[idx].id} to rule failed`,
            HttpStatus.CONFLICT
          );
        }
      }
    });
  }

  async create(dto: CreateOrderDTO, nonce?: string) {
    let hotel = null;
    let merchantId = null;
    let vouchers = null;
    const isRideMerchant = await this.merchantService.fetchMerchantType(
      dto.merchantId
    );

    console.log(`Merchant Type : ${JSON.stringify(isRideMerchant)}`);

    if (isRideMerchant?.merchant_type === MerchantType.RIDES) {
      merchantId = dto.merchantId;
      try {
        hotel = await this.hotelService.findOne({
          where: {
            id: dto.hotelId,
          },
        });
        if (!hotel.isActive) {
          throw new HttpException("Hotel is inactive", HttpStatus.CONFLICT);
        }
        vouchers = await this.validateVouchers(dto);
      } catch (error) {
        this.logger.error(`@create: Failed order validation: ${error}`);
        throw new HttpException(
          "Failed order validation",
          HttpStatus.BAD_REQUEST
        );
      }

      const merchant = await this.merchantService.findOne({
        where: {
          id: merchantId,
        },
      });

      if (!merchant) {
        throw new HttpException(
          `Merchant not found - Order could not be processed`,
          HttpStatus.BAD_REQUEST
        );
      }
      if (!merchant.isActive) {
        throw new HttpException(
          `Merchant not active - Order could not be processed`,
          HttpStatus.BAD_REQUEST
        );
      }
      const { orderCalculation, perDiemVoucherValue, discountVoucherValue } =
        this.rideCalculationService.calculate(
          dto.rideGrandTotal,
          +dto.tip,
          vouchers,
          dto.orderType as unknown as PaymentType
        );
      this.logger.log(
        `Order Calculations: ${JSON.stringify(orderCalculation)}, 
          Per Diem Voucher Value: ${perDiemVoucherValue}, 
          Discount Voucher Value: ${discountVoucherValue}`
      );
      let orderStatus = null;
      if (dto.orderType == OrderType.CREDIT_CARD) {
        orderStatus = OrderStatusEnum.INITIATED;
        // if we have scheduledDate set then we put the status to SCHEDULED after payment intent has succeeded
      }
      let appliedVoucherAmount = new Decimal(0);
      if (!perDiemVoucherValue.eq(0)) {
        appliedVoucherAmount = perDiemVoucherValue;
      }
      if (!discountVoucherValue.eq(0)) {
        appliedVoucherAmount = discountVoucherValue;
      }
      console.log(
        "---------------------------orderStatus------------------------------"
      );
      console.log(orderStatus);
      console.log(
        "---------------------------orderStatus------------------------------"
      );

      const scheduledDate = new Date(dto.scheduledDate);
      const scheduledDateUTC = new Date(
        scheduledDate.getTime() -
          getTimezoneOffset(DEFAULT_SYSTEM_TIMEZONE, scheduledDate)
      );
      dto.scheduledDate = scheduledDateUTC;

      const orderObject = await this.constructOrderObject(
        dto,
        orderStatus,
        hotel,
        merchantId,
        vouchers.orderVoucher,
        orderCalculation,
        appliedVoucherAmount.toNumber()
      );

      const orderEntity = await this._repository.save({
        ...orderObject,
        nonce,
      });
      if (vouchers.orderVoucher) {
        this.logger.log("Claiming voucher: ", vouchers.orderVoucher);
        this.logger.log("Claiming voucher-id: ", vouchers.orderVoucher.id);
        if (
          vouchers.orderVoucher.voucherProgramType !=
          VoucherProgramType.DISCOUNT
        ) {
          await this.voucherCodeService.update(
            {
              id: vouchers.orderVoucher.id,
            },
            {
              claimedDate: new Date(Date.now()),
            }
          );
        }

        try {
          let amountUsed = new Decimal(0);
          if (
            vouchers.orderVoucher.voucherProgramType ==
            VoucherProgramType.PER_DIEM
          ) {
            if (vouchers.orderVoucher.amountUsed) {
              const voucherValueUsed = new Decimal(
                vouchers.orderVoucher.amountUsed ?? 0
              );
              amountUsed = voucherValueUsed.add(appliedVoucherAmount);
            } else {
              amountUsed = appliedVoucherAmount;
            }
          }
          await this.voucherCodeService.update(
            {
              id: vouchers.orderVoucher.id,
            },
            {
              amountUsed: amountUsed.toNumber(),
            }
          );
        } catch (err) {
          console.log(`failed-to-update voucherCode amountUsed: `, err);
        }
      }
      try {
        if (orderEntity.scheduledDate) {
          const city = await this.cityService.findOne({
            where: {
              id: hotel.cityId,
            },
          });

          const orderDate = new Date(orderEntity.orderDate);
          const orderDateUTC = Date.UTC(
            orderDate.getUTCFullYear(),
            orderDate.getUTCMonth(),
            orderDate.getUTCDate(),
            orderDate.getUTCHours(),
            orderDate.getUTCMinutes(),
            orderDate.getUTCSeconds()
          );

          console.log(
            `Scheduled Date UTC: ${orderEntity.scheduledDate} VS Order Date UTC: ${orderDateUTC}`
          );
          await this.cacheManager.set(
            orderEntity.orderType === OrderType.PAY_LATER
              ? getPayLaterOrderKey(orderEntity.id)
              : getScheduledRidesOrderKey(orderEntity.id),
            {
              id: orderEntity.id,
              scheduledDate: orderEntity.scheduledDate,
              timezone: city.timezone,
              orderType: orderEntity.orderType,
              createdDate: new Date(orderDateUTC),
            }
          );
        }
      } catch (err) {
        //this should notify some type of alarm that the order did not go through
        this.logger.error(`Failed saving scheduled order: ${err.message}`);
      }

      await Promise.all([
        this.orderStatusRepository.save({
          orderId: orderEntity.id,
          orderVersion: orderEntity.version,
          status: orderStatus,
        }),
      ]);
      // proceed with payment if needed
      this.eventEmitter.emit(ORDER_CREATED_EVENT, {
        id: orderEntity.id,
        nonce: orderEntity.nonce,
        version: orderEntity.version,
        status: orderStatus,
      });
      return await this.getOrderDetails(orderEntity.id);
    } else {
      try {
        hotel = await this.hotelService.findOne({
          where: {
            id: dto.hotelId,
          },
        });
        if (!hotel.isActive) {
          throw new HttpException("Hotel is inactive", HttpStatus.CONFLICT);
        }
        if (!hotel.menuId) {
          throw new HttpException(
            "Hotel does not have a published menu",
            HttpStatus.CONFLICT
          );
        }

        vouchers = await this.validateVouchers(dto);
        await this.validateItems(hotel.menuId, dto.items);

        merchantId = await this.validateMerchantForMenu(
          hotel.menuId,
          dto.mealPeriodId,
          dto.items.map((item) => item.id)
        );
      } catch (error) {
        this.logger.error(`@create: Failed order validation: ${error}`);
        throw new HttpException(
          "Failed order validation",
          HttpStatus.BAD_REQUEST
        );
      }

      const merchant = await this.merchantService.findOne({
        where: {
          id: merchantId,
        },
      });

      if (!merchant) {
        throw new HttpException(
          `Merchant not found - Order could not be processed`,
          HttpStatus.BAD_REQUEST
        );
      }
      const isShipdayAllDayDeliveryEnabled =
        await this.appConfigService.fetchFeatureFlagValue(
          "enable_shipday_all_day_delivery"
        );
      const items: IOrderItem[] = await this.constructOrderItemsForCalculation(
        dto.items,
        merchant.id,
        hotel.menuId
      );
      this.logger.log(`Items for calculation: ${JSON.stringify(items)}`);

      if (!merchant.isActive) {
        throw new HttpException(
          `Merchant not active - Order could not be processed`,
          HttpStatus.BAD_REQUEST
        );
      }
      try {
        await this.validateVoucherRules(vouchers.prefixeVouchers, items);
      } catch (error) {
        this.logger.error(`@create: Failed voucher validation: ${error}`);
        throw new HttpException(
          "Failed voucher validation",
          HttpStatus.BAD_REQUEST
        );
      }

      let shipdayDeliveryFee = 0;
      let relayCanDeliveryToAddress = false;
      let hasDeliveryFee = areSimilarCoordinates(
        hotel?.coordinates,
        merchant?.coordinates
      )
        ? false
        : hotel.hasDeliveryFee;
      let isInHouseDelivery = false;
      console.log(
        `Third Party Delivery : ${JSON.stringify({
          merchantThirdParty: merchant?.hasThirdPartyDelivery,
          hotelThirdParty: hotel?.hasThirdPartyDelivery,
          areSimilarCoordinates: areSimilarCoordinates(
            hotel?.coordinates,
            merchant?.coordinates
          ),
        })}`
      );

      if (
        merchant?.hasThirdPartyDelivery &&
        hotel?.hasThirdPartyDelivery &&
        hasDeliveryFee
      ) {
        const relayQuote = await this.relayService.getQuote(
          merchantId,
          hotel.webCode
        );
        console.log(
          `Relay Delivery : ${JSON.stringify({
            relayAddress: "quote" in relayQuote ? true : false,
          })}`
        );
        relayCanDeliveryToAddress = "quote" in relayQuote ? true : false;

        if (
          !relayCanDeliveryToAddress ||
          isWithInOverNightTimeRange(isShipdayAllDayDeliveryEnabled, new Date())
        ) {
          const getDeliveryFee = await this.shipdayService.checkAvailability(
            hotel.webCode,
            merchant.id
          );
          console.log(
            `Charged delivery Fee from Shipday for ${nonce}: ${JSON.stringify(
              getDeliveryFee
            )}`
          );
          shipdayDeliveryFee = getDeliveryFee?.fee ?? 0;
        }
      } else if (
        hotel?.hasThirdPartyDelivery &&
        !merchant?.hasThirdPartyDelivery &&
        hasDeliveryFee
      ) {
        isInHouseDelivery = true;
        console.log("In house delivery Fee triggered.");
      }

      const { orderCalculation, perDiemVoucherValue, discountVoucherValue } =
        this.orderCalculationService.calculate(
          items,
          Number(dto.tip),
          hotel.isTaxExempt,
          merchant.taxRate,
          vouchers,
          dto.orderType as unknown as PaymentType,
          hasDeliveryFee,
          shipdayDeliveryFee,
          relayCanDeliveryToAddress,
          isInHouseDelivery
        );
      this.logger.log(
        `Order Calculations: ${JSON.stringify(orderCalculation)}, 
          Per Diem Voucher Value: ${perDiemVoucherValue}, 
          Discount Voucher Value: ${discountVoucherValue}`
      );

      let orderStatus = null;
      if (dto.orderType == OrderType.ROOM_CHARGE) {
        orderStatus = OrderStatusEnum.PENDING;
        if (dto.scheduledDate) {
          orderStatus = OrderStatusEnum.SCHEDULED;
        }
      }
      if (dto.orderType == OrderType.CREDIT_CARD) {
        orderStatus = OrderStatusEnum.INITIATED;
        // if we have scheduledDate set then we put the status to SCHEDULED after payment intent has succeeded
      }
      let appliedVoucherAmount = new Decimal(0);
      if (!perDiemVoucherValue.eq(0)) {
        appliedVoucherAmount = perDiemVoucherValue;
      }
      if (!discountVoucherValue.eq(0)) {
        appliedVoucherAmount = discountVoucherValue;
      }
      console.log(
        "---------------------------orderStatus------------------------------"
      );
      console.log(orderStatus);
      console.log(
        "---------------------------orderStatus------------------------------"
      );

      const orderObject = await this.constructOrderObject(
        dto,
        orderStatus,
        hotel,
        merchantId,
        vouchers.orderVoucher,
        orderCalculation,
        appliedVoucherAmount.toNumber()
      );

      const orderEntity = await this._repository.save({
        ...orderObject,
        nonce,
      });
      if (vouchers.orderVoucher) {
        this.logger.log("Claiming voucher: ", vouchers.orderVoucher);
        this.logger.log("Claiming voucher-id: ", vouchers.orderVoucher.id);
        if (
          vouchers.orderVoucher.voucherProgramType !=
          VoucherProgramType.DISCOUNT
        ) {
          await this.voucherCodeService.update(
            {
              id: vouchers.orderVoucher.id,
            },
            {
              claimedDate: new Date(Date.now()),
            }
          );
        }

        try {
          let amountUsed = new Decimal(0);
          if (
            vouchers.orderVoucher.voucherProgramType ==
            VoucherProgramType.PER_DIEM
          ) {
            if (vouchers.orderVoucher.amountUsed) {
              const voucherValueUsed = new Decimal(
                vouchers.orderVoucher.amountUsed ?? 0
              );
              amountUsed = voucherValueUsed.add(appliedVoucherAmount);
            } else {
              amountUsed = appliedVoucherAmount;
            }
          }
          await this.voucherCodeService.update(
            {
              id: vouchers.orderVoucher.id,
            },
            {
              amountUsed: amountUsed.toNumber(),
            }
          );
        } catch (err) {
          console.log(`failed-to-update voucherCode amountUsed: `, err);
        }
      }
      if (vouchers.prefixeVouchers) {
        //TODO: implement logic for prefixe vouchers
      }
      try {
        if (orderEntity.scheduledDate) {
          const city = await this.cityService.findOne({
            where: {
              id: hotel.cityId,
            },
          });
          const scheduledDate = new Date(orderEntity.scheduledDate);
          const scheduledDateUTC = Date.UTC(
            scheduledDate.getUTCFullYear(),
            scheduledDate.getUTCMonth(),
            scheduledDate.getUTCDate(),
            scheduledDate.getUTCHours(),
            scheduledDate.getUTCMinutes(),
            scheduledDate.getUTCSeconds()
          );

          const orderDate = new Date(orderEntity.orderDate);
          const orderDateUTC = Date.UTC(
            orderDate.getUTCFullYear(),
            orderDate.getUTCMonth(),
            orderDate.getUTCDate(),
            orderDate.getUTCHours(),
            orderDate.getUTCMinutes(),
            orderDate.getUTCSeconds()
          );
          await this.cacheManager.set(getScheduledOrderKey(orderEntity.id), {
            id: orderEntity.id,
            scheduledDate: new Date(scheduledDateUTC),
            timezone: city.timezone,
            orderType: orderEntity.orderType,
            createdDate: new Date(orderDateUTC),
          });
        }
      } catch (err) {
        //this should notify some type of alarm that the order did not go through
        this.logger.error(`Failed saving scheduled order: ${err.message}`);
      }

      await Promise.all([
        this.saveOrderItems(
          orderEntity.id,
          dto.items,
          merchant.id,
          hotel.menuId
        ),
        this.orderStatusRepository.save({
          orderId: orderEntity.id,
          orderVersion: orderEntity.version,
          status: orderStatus,
        }),
      ]);
      // proceed with payment if needed
      this.eventEmitter.emit(ORDER_CREATED_EVENT, {
        id: orderEntity.id,
        nonce: orderEntity.nonce,
        version: orderEntity.version,
        status: orderStatus,
      });
      return await this.getOrderDetails(orderEntity.id);
    }
  }

  async findAll(
    page?: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let skip,
      take = null;
    if (page !== undefined && page > 0) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    } else {
      take = parseInt(process.env.PAGINATION_TAKE, 10) || 20;
      skip = 0;
    }
    let qb = this.getOrderListQueryBuilder(null, null, filters, isExport);
    const [data, total] = await Promise.all([
      isExport ? qb.getRawMany() : qb.limit(take).offset(skip).getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }

  async findAllWithPagination(page?: number, filters?: OrderListFilters) {
    const yesterdayInMilliseconds = this.getYesterdayInMilliseconds();
    let skip,
      take = null;
    if (page !== undefined && page > 0) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    } else {
      take = parseInt(process.env.PAGINATION_TAKE, 10) || 20;
      skip = 0;
    }
    let qb = this.getOrderListQueryBuilder(null, null, filters);
    if (filters.status !== "SCHEDULED") {
      qb = qb
        .andWhere("(o.updated_at >= :updatedAt)")
        .setParameter("updatedAt", formatDate(yesterdayInMilliseconds));
    }
    const [data, total] = await Promise.all([
      qb.limit(take).offset(skip).getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }

  async findByHotel(
    hotelId: number,
    page: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let skip,
      take = null;
    if (page !== undefined && page > 0) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    } else {
      take = parseInt(process.env.PAGINATION_TAKE, 10) || 20;
      skip = 0;
    }
    const qb = this.getOrderListQueryBuilder(hotelId, null, filters, isExport);
    const [data, total] = await Promise.all([
      isExport ? qb.getRawMany() : qb.limit(take).offset(skip).getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }

  async changeScheduledOrderToPending(orderIds: number[]) {
    if (!orderIds || orderIds.length == 0) {
      return;
    }
    await this.update(
      {
        id: In(orderIds),
      },
      {
        status: OrderStatusEnum.PENDING,
        orderDate: new Date(),
      }
    );
    const orders = await this.find({
      where: {
        id: In(orderIds),
      },
    });
    const pusherPromises = [];
    orders.forEach((order) => {
      pusherPromises.push(
        this.pusherService.trigger(ORDER_CHANNEL, ORDER_CREATED_EVENT, {
          id: order.id,
          nonce: order.nonce,
          version: order.version,
          status: order.status,
        })
      );
    });
    try {
      await Promise.all(pusherPromises);
    } catch (err) {
      this.logger.error(
        `Error@changeScheduledOrderToPending-pusher: ${err.message}`
      );
    }
  }

  getYesterdayInMilliseconds = () => {
    const todayInMilliseconds = Date.now();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const yesterdayInMilliseconds = todayInMilliseconds - oneDayInMilliseconds;
    return yesterdayInMilliseconds;
  };

  async listTodayOrders(hotelId?: number, merchantId?: number) {
    const yesterdayInMilliseconds = this.getYesterdayInMilliseconds();
    let qb = await this.getActiveOrderListQueryBuilder(hotelId, merchantId);
    qb = qb
      .andWhere(
        "(CAST(o.status AS text) = :status OR o.updated_at >= :updatedAt)"
      )
      .setParameter("status", OrderStatusEnum.SCHEDULED)
      .setParameter("updatedAt", formatDate(yesterdayInMilliseconds));
    return await qb.getRawMany();
  }

  async listTodayOrdersWithDetails(hotelId?: number, merchantId?: number) {
    const yesterdayInMilliseconds = this.getYesterdayInMilliseconds();

    let qb = this.getOrderListQueryBuilder(hotelId, merchantId);
    qb = qb
      .leftJoin("order_items", "oi", "oi.order_id = o.id")
      .leftJoin("order_item_modifiers", "oim", "oim.order_item_id = oi.id")
      .leftJoin(
        "order_item_modifier_options",
        "oimo",
        "oimo.order_item_modifier_id = oim.id"
      )
      .addSelect([
        "oi.id as order_item_id",
        "oi.item_name as order_item_name",
        "oi.item_id as order_item_item_id",
        "oi.quantity as order_item_quantity",
        "oi.price as order_item_price",
        "oi.voucher_code as order_item_voucher_code",
        "oi.voucher_code_id as order_item_voucher_code_id",
        "oi.order_id as order_item_order_id",
        "oim.id as order_item_modifier_id",
        "oim.modifier_name as order_item_modifier_name",
        "oim.modifier_id as modifier_id",
        "oim.order_item_id as order_item_modifier_order_item_id",
        "oim.order_id as order_item_modifier_order_id",
        "oim.item_id as order_item_modifier_item_id",
        "oim.modifier_id as order_item_modifier_modifier_id",
        "oimo.id as order_item_modifier_option_id",
        "oimo.modifier_option_name as order_item_modifier_option_name",
        "oimo.quantity as order_item_modifier_option_quantity",
        "oimo.price as order_item_modifier_option_price",
        "oimo.order_id as order_item_modifier_option_order_id",
        "oimo.order_item_modifier_id as order_item_modifier_option_order_item_modifier_id",
        "oimo.order_item_id as order_item_modifier_option_order_item_id",
        "oimo.modifier_id as order_item_modifier_option_modifier_id",
        "oimo.item_id as order_item_modifier_option_item_id",
        "oimo.modifier_name as order_item_modifier_option_modifier_name",
        "oimo.modifier_option_id as order_item_modifier_option_modifier_option_id",
      ])
      .andWhere("(o.status = :status OR o.updated_at >= :updatedAt)")
      .setParameter("status", OrderStatusEnum.SCHEDULED)
      .setParameter("updatedAt", formatDate(yesterdayInMilliseconds));

    const data = await qb.getRawMany();
    const ordersMap = new Map();

    data.forEach((row) => {
      const orderKey = row.id;
      const orderItemKey = row.order_item_id;
      const orderItemModifierKey = row.order_item_modifier_id;
      const orderItemModifierOptionKey = row.order_item_modifier_option_id;

      if (!ordersMap.has(orderKey)) {
        ordersMap.set(orderKey, {
          ...row,
          items: [],
          hotelId: row.hotel_id,
          hotelName: row.hotel_name,
          hotelCode: row.hotel_code,
          hotelWebCode: row.hotel_web_code,
          hotelUuid: row.hotel_uuid,
          hotelAddressNumber: row.hotel_address_number,
          hotelAddressStreet: row.hotel_address_street,
          hotelAddressTown: row.hotel_address_town,
          hotelAddressZipCode: row.hotel_address_zip_code,
          merchantId: row.merchant_id,
          merchantName: row.merchant_name,
          mealPeriodName: row.meal_period_name || null,
          timezone: row.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
          payer: row.payer === "TENANT" ? "ALFRED" : "HOTEL",
          paymentIntentId: row.payment_log_payment_intent_id ?? null,
          voucherTotalAmount: row.voucher_total_amount ?? null,
          voucherPayerPercentage: row.voucher_payer_percentage ?? null,
        });
      }

      const order = ordersMap.get(orderKey);

      if (
        orderItemKey &&
        !order.items.find((item) => item.id === orderItemKey)
      ) {
        const orderItem = {
          id: row.order_item_id,
          orderId: row.order_item_order_id,
          itemId: row.order_item_item_id,
          itemName: row.order_item_name,
          quantity: row.order_item_quantity,
          price: row.order_item_price,
          voucherCode: row.order_item_voucher_code,
          voucherCodeId: row.order_item_voucher_code_id,
          modifiers: [],
        };
        order.items.push(orderItem);
      }

      const item = order.items.find((item) => item.id === orderItemKey);

      if (
        orderItemModifierKey &&
        !item.modifiers?.find((mod) => mod.id === orderItemModifierKey)
      ) {
        const modifier = {
          id: row.order_item_modifier_id,
          orderId: row.order_item_modifier_order_id,
          modifierName: row.order_item_modifier_name,
          orderItemId: row.order_item_modifier_order_item_id,
          itemId: row.order_item_modifier_item_id,
          modifierId: row.order_item_modifier_modifier_id,
          options: [],
        };
        item.modifiers?.push(modifier);
      }

      const modifier = item?.modifiers?.find(
        (mod) => mod.id === orderItemModifierKey
      );

      if (
        orderItemModifierOptionKey &&
        !modifier.options.find((opt) => opt.id === orderItemModifierOptionKey)
      ) {
        const option = {
          id: row.order_item_modifier_option_id,
          orderId: row.order_item_modifier_option_order_id,
          orderItemId: row.order_item_modifier_option_order_item_id,
          orderItemModifierId:
            row.order_item_modifier_option_order_item_modifier_id,
          modifierOptionName: row.order_item_modifier_option_name,
          quantity: row.order_item_modifier_option_quantity,
          price: row.order_item_modifier_option_price,
          itemId: row.order_item_modifier_option_item_id,
          modifierId: row.order_item_modifier_option_modifier_id,
          modifierName: row.order_item_modifier_option_modifier_name,
          modifierOptionId: row.order_item_modifier_option_modifier_option_id,
        };
        modifier.options.push(option);
      }
    });

    const orders = Array.from(ordersMap.values());
    return orders;
  }

  async countTodayOrders() {
    const yesterdayInMilliseconds = this.getYesterdayInMilliseconds();

    let qb = this.connection
      .createQueryBuilder()
      .select("count(1)")
      .from("orders", "o");
    qb = qb
      .andWhere(
        "(CAST(o.status AS text) = :status OR o.updated_at >= :updatedAt)"
      )
      .setParameter("status", OrderStatusEnum.SCHEDULED)
      .setParameter("updatedAt", formatDate(yesterdayInMilliseconds));
    return await qb.getRawOne();
  }
  async getOrderStatistics(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters,
    excludeInitiated: boolean = false
  ) {
    const [
      activeOrders,
      canceledOrders,
      deliveredOrders,
      totalNetOrders,
      refundAmountOrders,
      grandTotalOrders,
    ] = await Promise.all([
      this.getActiveOrdersStatistic(
        hotelId,
        merchantId,
        filters,
        excludeInitiated
      ),
      this.getCanceledOrdersStatistic(hotelId, merchantId, filters),
      this.getDeliveredOrdersStatistic(hotelId, merchantId, filters),
      this.getTotalNetOrdersStatistic(hotelId, merchantId, filters),
      this.getRefundAmountOrdersStatistic(hotelId, merchantId, filters),
      this.getGrandTotalOrdersStatistic(hotelId, merchantId, filters),
    ]);
    return {
      activeOrders,
      canceledOrders,
      deliveredOrders,
      totalNetOrders,
      refundAmountOrders,
      grandTotalOrders,
    };
  }
  async getActiveOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters,
    excludeInitiated: boolean = false
  ) {
    const statuses = [
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.CANCELED,
      OrderStatusEnum.SCHEDULED,
    ];

    if (excludeInitiated) {
      statuses.push(OrderStatusEnum.INITIATED);
    }
    let qb = this.connection
      .createQueryBuilder()
      .select("count(id)")
      .from("orders", "o")
      .andWhere("CAST(o.status AS text) NOT IN (:...statuses)")
      .setParameter("statuses", statuses);
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return +data?.count || 0;
  }
  async getCanceledOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    let qb = this.connection
      .createQueryBuilder()
      .select("count(id)")
      .from("orders", "o")
      .andWhere("CAST(o.status AS text) = :status")
      .setParameter("status", OrderStatusEnum.CANCELED);
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return +data?.count || 0;
  }
  async getDeliveredOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    let qb = this.connection
      .createQueryBuilder()
      .select("count(id)")
      .from("orders", "o")
      .andWhere("CAST(o.status AS text) = :status")
      .setParameter("status", OrderStatusEnum.DELIVERED);
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return +data?.count || 0;
  }
  async getTotalNetOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    let qb = this.connection
      .createQueryBuilder()
      .select("sum(hotel_total_net)")
      .from("orders", "o")
      .andWhere("CAST(o.status AS text) = :status")
      .setParameter("status", OrderStatusEnum.DELIVERED);
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return parseFloat(data?.sum ?? 0)?.toFixed(2) || 0;
  }
  async getRefundAmountOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    let qb = this.connection
      .createQueryBuilder()
      .select("sum(refund_amount)")
      .from("orders", "o");
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return parseFloat(data?.sum ?? 0)?.toFixed(2) || 0;
  }
  async getGrandTotalOrdersStatistic(
    hotelId?: number,
    merchantId?: number,
    filters?: OrderListFilters
  ) {
    let qb = this.connection
      .createQueryBuilder()
      .select("sum(hotel_grand_total)")
      .from("orders", "o")
      .andWhere("CAST(o.status AS text) = :status")
      .setParameter("status", OrderStatusEnum.DELIVERED);
    qb = this.getOrderFilters(qb, hotelId, merchantId, filters);
    const data = await qb.getRawOne();
    return parseFloat(data?.sum ?? 0)?.toFixed(2) || 0;
  }
  async findByMerchant(
    merchantId: number,
    page: number,
    filters?: OrderListFilters,
    isExport: boolean = false
  ) {
    let skip,
      take = null;
    if (page !== undefined && page > 0) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    } else {
      take = parseInt(process.env.PAGINATION_TAKE, 10) || 20;
      skip = 0;
    }
    const qb = this.getMerchantOrderListQueryBuilder(
      null,
      merchantId,
      filters,
      isExport
    );
    const [data, total] = await Promise.all([
      isExport ? qb.getRawMany() : qb.limit(take).offset(skip).getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }
  async getOrderStatuses(orderId: number) {
    return await this.orderStatusRepository.find({
      where: {
        orderId,
      },
    });
  }
  async getSlackOrderDetails(nonce: string) {
    const qb = this._repository
      .createQueryBuilder("o")
      .innerJoin("order_status", "os", "os.order_id = o.id")
      .innerJoin("hotels", "h", "h.id = o.hotel_id")
      .innerJoin("merchants", "m", "m.id = o.merchant_id")
      .leftJoin("voucher_codes", "vc", "vc.code = o.voucher_code")
      .leftJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .select([
        "os.id AS os_id",
        "os.order_id AS os_order_id",
        "os.order_version AS os_order_version",
        "os.status AS os_status",
        "os.relay_response AS os_relay_response",
        "os.created_at AS os_created_at",
        "o.applied_voucher_amount AS  order_voucher_amount",
        "o.nonce AS order_nonce",
        "o.client_name AS order_clientName",
        "o.room_number AS order_roomNumber",
        "o.client_number AS order_clientNumber",
        "o.created_at AS order_createdAt",
        "o.scheduled_date AS order_scheduledDate",
        "o.grand_total AS order_grandtotal",
        "h.name AS hotel_name",
        "m.name AS merchant_name",
        "vp.type AS voucher_type",
        "vp.payer AS voucher_payer",
      ])
      .where("o.nonce = :nonce", { nonce })
      .andWhere("o.deleted_at IS NULL")
      .getRawMany();
    return qb;
  }

  async getOrderDetails(
    orderId: number,
    merchantId?: number,
    hotelId?: number,
    loadItems = true
  ) {
    let qb = this._repository
      .createQueryBuilder("o")
      .innerJoin("hotels", "h", "h.id = o.hotel_id")
      .innerJoin("merchants", "m", "m.id = o.merchant_id")
      .innerJoin("meal_period", "mp", "mp.id = o.meal_period_id")
      .innerJoin("cities", "c", "c.id = h.city_id")
      .leftJoin("voucher_codes", "vc", "vc.id = o.voucher_code_id")
      .leftJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .select(
        `
      o.version, 
      o.created_at, 
      o.updated_at, 
      o.deleted_at, 
      o.id, 
      o._id, 
      o.nonce, 
      o.hotel_id, 
      o.merchant_id, 
      o.order_number, 
      o.status, 
      o.client_name, 
      o.client_number, 
      o.client_email, 
      o.order_type, 
      o.voucher_code, 
      o.voucher_code_id, 
      o.receipt_amount, 
      o.total_net, 
      o.tax_amount, 
      o.total_gross, 
      o.grand_total, 
      o.voucher_price, 
      o.applied_voucher_amount, 
      o.refund_amount, 
      o.hotel_total_net, 
      o.hotel_tax_amount, 
      o.hotel_total_gross, 
      o.hotel_grand_total, 
      o.scheduled_date, 
      o.comment, 
      o.room_number, 
      o.cancel_reason, 
      o.cancel_option, 
      o.tip, 
      o.delivery_fee, 
      o.meal_period_id, 
      o.payment_status, 
      o.order_date, 
      o.number_of_cutleries,
      o.has_alcohol,
      h.id as hotel_id,
      h.name as hotel_name,
      h.code as hotel_code,
      h.web_code as hotel_web_code,
      h._id as hotel_uuid,
      h.address_number as hotel_address_number,
      h.address_street as hotel_address_street,
      h.address_town as hotel_address_town,
      h.address_zip_code as hotel_address_zip_code,
      m.has_third_party_delivery as merchant_has_third_party_delivery,
      h.has_third_party_delivery as hotel_has_third_party_delivery,
      m.id as merchant_id,
      m.name as merchant_name,
      m.merchant_type as merchant_type,
      mp.name as meal_period_name,
      c.timezone,
      vp.payer,
      vp.type,
      vp.payer_percentage,
      vp.total_amount,
      CASE
        WHEN o.payment_status = 'succeeded' THEN true
        ELSE false
      END as is_paid
    `
      )
      .andWhere({
        id: orderId,
        ...(merchantId ? { merchantId } : null),
        ...(hotelId ? { hotelId } : null),
      });

    const order = await qb.getRawOne();
    const items = loadItems ? await this.getOrderItems(orderId) : [];
    const orderStatus = await this.orderStatusRepository.findOne({
      where: {
        relayResponse: Not("null"),
        orderId: order.id,
      },
      order: {
        createdAt: "DESC",
      },
    });

    const paymentLog = await this.fetchSuccessfulPaymentLogByOrderId(order.id);

    return {
      ...order,
      items: items,
      hotelId: order.hotel_id,
      hotelName: order.hotel_name,
      hotelCode: order.hotel_code,
      hotelWebCode: order.hotel_web_code,
      hotelUuid: order.hotel_uuid,
      hotelAddressNumber: order.hotel_address_number,
      hotelAddressStreet: order.hotel_address_street,
      hotelAddressTown: order.hotel_address_town,
      hotelAddressZipCode: order.hotel_address_zip_code,
      merchantId: order.merchant_id,
      merchantName: order.merchant_name,
      merchantType: order.merchant_type,
      mealPeriodName: order.meal_period_name || null,
      relayResponse: orderStatus?.relayResponse ?? null,
      paymentIntentId: paymentLog?.paymentIntentId ?? null,
      relayUrl: orderStatus?.relayResponse?.order?.orderKey
        ? getRelayOrderUrl(orderStatus?.relayResponse?.order.orderKey)
        : null,
      stripeUrl: paymentLog?.paymentIntentId
        ? getStripeOrderUrl(paymentLog?.paymentIntentId)
        : null,
      timezone: order.timezone ?? DEFAULT_SYSTEM_TIMEZONE,
      payer: order.payer === "TENANT" ? "ALFRED" : "HOTEL",
      hasThirdPartyDelivery:
        order.merchant_has_third_party_delivery ||
        order.hotel_has_third_party_delivery ||
        false,
    };
  }

  async fetchSuccessfulPaymentLogByOrderId(orderId: number) {
    const paymentLog = await this.paymentLogRepository.findOne({
      where: {
        orderId: orderId,
        paymentIntentId: Not("null"),
        paymentProvider: Not("NONE"),
        status: "succeeded",
      },
    });
    return paymentLog;
  }

  async findOrderByVersion(
    id: number,
    hotelId: number,
    merchantId: number,
    version: number
  ) {
    const orderEntity = await this.findOne({
      where: {
        id,
        version: version,
        ...(hotelId ? { hotelId } : null),
        ...(merchantId ? { merchantId } : null),
      },
    });
    if (!orderEntity) {
      throw new HttpException(
        `Order with id:${id} and version: ${version} does not exist`,
        HttpStatus.NOT_FOUND
      );
    }
    return orderEntity;
  }

  async pendingOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    updateOrderStatusDTO: UpdateOrderStatusDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      updateOrderStatusDTO.version
    );
    if (orderEntity.status != OrderStatusEnum.SCHEDULED) {
      throw new HttpException(
        `From ${OrderStatusEnum.SCHEDULED} to ${OrderStatusEnum.PENDING}} violation`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.PENDING,
      }
    );

    try {
      await this.cacheManager.del(getScheduledOrderKey(orderEntity.id));
    } catch (err) {
      this.logger.debug(`pendingOrder@cachemanager.del ${err.message}`);
    }

    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.PENDING,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async confirmOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    updateOrderStatusDTO: UpdateOrderStatusDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      updateOrderStatusDTO.version
    );
    if (orderEntity.status != OrderStatusEnum.PENDING) {
      throw new HttpException(
        `From ${OrderStatusEnum.PENDING} to ${OrderStatusEnum.CONFIRMED} violation`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.CONFIRMED,
      }
    );

    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.CONFIRMED,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async prepareOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    updateOrderStatusDTO: UpdateOrderStatusDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      updateOrderStatusDTO.version
    );
    if (orderEntity.status != OrderStatusEnum.CONFIRMED) {
      throw new HttpException(
        `From ${OrderStatusEnum.CONFIRMED} to ${OrderStatusEnum.PREPARATION} violation`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.PREPARATION,
      }
    );
    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.PREPARATION,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async inDeliveryOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    updateOrderStatusDTO: UpdateOrderStatusDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      updateOrderStatusDTO.version
    );
    if (orderEntity.status != OrderStatusEnum.PREPARATION) {
      throw new HttpException(
        `From ${OrderStatusEnum.CONFIRMED} to ${OrderStatusEnum.IN_DELIVERY} violation`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.IN_DELIVERY,
      }
    );
    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.IN_DELIVERY,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async deliveredOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    updateOrderStatusDTO: UpdateOrderStatusDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      updateOrderStatusDTO.version
    );
    if (
      orderEntity.status != OrderStatusEnum.IN_DELIVERY &&
      orderEntity.status != OrderStatusEnum.SCHEDULED
    ) {
      throw new HttpException(
        `From ${OrderStatusEnum.IN_DELIVERY} or ${OrderStatusEnum.SCHEDULED} to ${OrderStatusEnum.DELIVERED} violation`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.DELIVERED,
      }
    );
    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.DELIVERED,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async cancelOrder(
    id: number,
    hotelId: number,
    merchantId: number,
    cancelOrderDTO: CancelOrderDTO
  ) {
    const orderEntity = await this.findOrderByVersion(
      id,
      hotelId,
      merchantId,
      cancelOrderDTO.version
    );
    const isRideMerchant = await this.merchantService.fetchMerchantType(
      orderEntity?.merchantId
    );

    if (isRideMerchant?.merchant_type === MerchantType.RIDES) {
      //Trigger an event to cancel the carmel Trip
      this.eventEmitter.emit(CARMEL_TRIP_CANCEL_EVENT, {
        nonce: orderEntity?.nonce,
        orderId: id,
      });
    }
    if (
      orderEntity.status == OrderStatusEnum.IN_DELIVERY ||
      orderEntity.status == OrderStatusEnum.DELIVERED
    ) {
      throw new HttpException(
        `Can't cancel an order from ${orderEntity.status} status`,
        HttpStatus.BAD_REQUEST
      );
    }
    const updatedOrder = await this.update(
      { id },
      {
        status: OrderStatusEnum.CANCELED,
        cancelReason: cancelOrderDTO.reason,
        cancelOption: cancelOrderDTO.option,
      }
    );
    try {
      await this.cacheManager.del(getScheduledOrderKey(orderEntity.id));
    } catch (err) {
      this.logger.debug(`cancelOrder@cachemanager.del ${err.message}`);
    }
    console.log(`orderEntity: `, orderEntity);
    if (orderEntity.voucherCodeId) {
      const voucherCode = await this.voucherCodeService.getWithVoucherProgram(
        orderEntity.voucherCodeId
      );
      console.log("voucherCode: ", voucherCode);
      if (voucherCode?.voucher_program_type === VoucherProgramType.PER_DIEM) {
        let updatedVoucherAmount = new Decimal(voucherCode.amount_used).minus(
          orderEntity.appliedVoucherAmount
        );
        if (updatedVoucherAmount.comparedTo(new Decimal(0)) < 0) {
          updatedVoucherAmount = new Decimal(0);
        }
        console.log(`updatedVoucherAmount: `, updatedVoucherAmount.toNumber());
        await this.voucherCodeService.update(
          {
            id: voucherCode.id,
          },
          {
            amountUsed: updatedVoucherAmount.toNumber(),
          }
        );
      }
    }

    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id,
      nonce: updatedOrder.nonce,
      status: OrderStatusEnum.CANCELED,
      version: updatedOrder.version,
      merchantId: orderEntity.merchantId,
      hotelId: orderEntity.hotelId,
      clientName: orderEntity.clientName,
      clientNumber: orderEntity.clientNumber,
      clientEmail: orderEntity.clientEmail,
      totalNet: orderEntity.totalNet,
      taxAmount: orderEntity.taxAmount,
      tip: orderEntity.tip,
      grandTotal: orderEntity.grandTotal,
      roomNumber: orderEntity.roomNumber,
      hasAlcohol: orderEntity.hasAlcohol,
    });
    return updatedOrder;
  }

  async cancelOrderById(
    orderEntity: Order,
    cancelReason: string,
    cancelOption: string
  ) {
    if (orderEntity.status !== OrderStatusEnum.CANCELED) {
      const isRideMerchant = await this.merchantService.fetchMerchantType(
        orderEntity?.merchantId
      );

      if (isRideMerchant?.merchant_type === MerchantType.RIDES) {
        //Trigger an event to cancel the carmel Trip
        this.eventEmitter.emit(CARMEL_TRIP_CANCEL_EVENT, {
          nonce: orderEntity?.nonce,
          orderId: orderEntity.id,
        });
      }
      if (
        orderEntity.status == OrderStatusEnum.IN_DELIVERY ||
        orderEntity.status == OrderStatusEnum.DELIVERED
      ) {
        throw new HttpException(
          `Can't cancel an order from ${orderEntity.status} status`,
          HttpStatus.BAD_REQUEST
        );
      }
      const updatedOrder = await this.update(
        { id: orderEntity.id },
        {
          status: OrderStatusEnum.CANCELED,
          cancelReason: cancelReason,
          cancelOption: cancelOption,
        }
      );
      try {
        await this.cacheManager.del(getScheduledOrderKey(orderEntity.id));
      } catch (err) {
        this.logger.debug(`cancelOrder@cachemanager.del ${err.message}`);
      }

      this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
        id: orderEntity.id,
        nonce: updatedOrder.nonce,
        status: OrderStatusEnum.CANCELED,
        version: updatedOrder.version,
        merchantId: orderEntity.merchantId,
        hotelId: orderEntity.hotelId,
        clientName: orderEntity.clientName,
        clientNumber: orderEntity.clientNumber,
        clientEmail: orderEntity.clientEmail,
        totalNet: orderEntity.totalNet,
        taxAmount: orderEntity.taxAmount,
        tip: orderEntity.tip,
        grandTotal: orderEntity.grandTotal,
        roomNumber: orderEntity.roomNumber,
        hasAlcohol: orderEntity.hasAlcohol,
      });
      return updatedOrder;
    } else {
      console.log(`Order is already cancelled.`);
      return orderEntity;
    }
  }

  formatOrderItems(result: any[]) {
    const itemsMap = new Map();

    result.forEach((row) => {
      if (!itemsMap.has(row.order_item_id)) {
        itemsMap.set(row.order_item_id, {
          id: row.order_item_id,
          orderId: row.order_item_order_id,
          itemId: row.order_item_item_id,
          itemName: row.order_item_name,
          quantity: row.order_item_quantity,
          price: row.order_item_price,
          voucherCode: row.order_item_voucher_code,
          voucherCodeId: row.order_item_voucher_code_id,
          modifiers: [],
        });
      }

      const item = itemsMap.get(row.order_item_id);

      if (row.order_item_modifier_id) {
        let modifier = item.modifiers.find(
          (itemModifier) => itemModifier.id === row.order_item_modifier_id
        );
        if (!modifier) {
          modifier = {
            id: row.order_item_modifier_id,
            orderId: row.order_item_modifier_order_id,
            modifierName: row.order_item_modifier_name,
            orderItemId: row.order_item_modifier_order_item_id,
            itemId: row.order_item_modifier_item_id,
            modifierId: row.order_item_modifier_modifier_id,
            options: [],
          };
          item.modifiers.push(modifier);
        }

        if (row.order_item_modifier_option_id) {
          modifier.options.push({
            id: row.order_item_modifier_option_id,
            orderId: row.order_item_modifier_option_order_id,
            orderItemId: row.order_item_modifier_option_order_item_id,
            orderItemModifierId:
              row.order_item_modifier_option_order_item_modifier_id,
            modifierOptionName: row.order_item_modifier_option_name,
            quantity: row.order_item_modifier_option_quantity,
            price: row.order_item_modifier_option_price,
            itemId: row.order_item_modifier_option_item_id,
            modifierId: row.order_item_modifier_option_modifier_id,
            modifierName: row.order_item_modifier_option_modifier_name,
            modifierOptionId: row.order_item_modifier_option_modifier_option_id,
          });
        }
      }
    });

    const orderItemsVM = Array.from(itemsMap.values()).map((orderItem) => {
      return new OrderItemVM({
        ...orderItem,
        modifiers: orderItem.modifiers.map((modifier) => {
          return new OrderItemModifierVM({
            ...modifier,
            options: new OrderItemModifierOptionVM(modifier.options).build(),
          }).build();
        }),
      }).build();
    });

    return orderItemsVM;
  }

  async getOrderItems(orderId: number) {
    const result = await this.orderItemRepository
      .createQueryBuilder("oi")
      .leftJoin("order_item_modifiers", "oim", "oim.order_item_id = oi.id")
      .leftJoin(
        "order_item_modifier_options",
        "oimo",
        "oimo.order_item_modifier_id = oim.id"
      )
      .addSelect([
        "oi.id as order_item_id",
        "oi.item_name as order_item_name",
        "oi.item_id as order_item_item_id",
        "oi.quantity as order_item_quantity",
        "oi.price as order_item_price",
        "oi.voucher_code as order_item_voucher_code",
        "oi.voucher_code_id as order_item_voucher_code_id",
        "oi.order_id as order_item_order_id",
        "oim.id as order_item_modifier_id",
        "oim.modifier_name as order_item_modifier_name",
        "oim.modifier_id as modifier_id",
        "oim.order_item_id as order_item_modifier_order_item_id",
        "oim.order_id as order_item_modifier_order_id",
        "oim.item_id as order_item_modifier_item_id",
        "oim.modifier_id as order_item_modifier_modifier_id",
        "oimo.id as order_item_modifier_option_id",
        "oimo.modifier_option_name as order_item_modifier_option_name",
        "oimo.quantity as order_item_modifier_option_quantity",
        "oimo.price as order_item_modifier_option_price",
        "oimo.order_id as order_item_modifier_option_order_id",
        "oimo.order_item_modifier_id as order_item_modifier_option_order_item_modifier_id",
        "oimo.order_item_id as order_item_modifier_option_order_item_id",
        "oimo.modifier_id as order_item_modifier_option_modifier_id",
        "oimo.item_id as order_item_modifier_option_item_id",
        "oimo.modifier_name as order_item_modifier_option_modifier_name",
        "oimo.modifier_option_id as order_item_modifier_option_modifier_option_id",
      ])
      .where("oi.order_id = :orderId", { orderId })
      .getRawMany();
    return this.formatOrderItems(result);
  }

  async deleteOrder(orderId: number) {
    // order_item_modifier_options
    // order_item_modifiers
    // order_items
    // order_calculations
    // order_status
    // orders
    await this.findOne({
      where: {
        id: orderId,
      },
    });
    await this.orderItemModifierOptionsRepository.delete({
      orderId,
    });
    await this.orderItemModifierRepository.delete({
      orderId,
    });
    await this.orderItemRepository.delete({
      orderId,
    });
    await this.orderCalculationRepository.delete({
      orderId,
    });
    await this.orderStatusRepository.delete({
      orderId,
    });
    await this.delete({
      id: orderId,
    });
  }

  async processOrderRefund(
    orderId: number,
    existingRefundAmount: number,
    existingVoucherAmount: number,
    refundAmount: number,
    voucherCodeId: number,
    queryRunner: QueryRunner
  ) {
    this.logger.log(
      `@processOrderRefund : orderId: ${orderId}, existingRefundAmount: ${existingRefundAmount}, refundAmount: ${refundAmount}, voucherCodeId: ${voucherCodeId}`
    );

    // Calculate the new refundAmount
    const updatedRefundAmount =
      Number(existingRefundAmount) + Number(refundAmount);

    try {
      await queryRunner.manager.update(
        Order,
        { id: orderId },
        {
          appliedVoucherAmount: existingVoucherAmount - refundAmount,
          refundAmount: updatedRefundAmount,
        }
      );

      await this.voucherCodeService.refundVoucherAmount(
        voucherCodeId,
        refundAmount,
        queryRunner
      );
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getOrdersWithCommissions(
    hotelId: number,
    page: number,
    filters?: OrderCommissionListFilters,
    isExport: boolean = false
  ) {
    let skip,
      take = null;

    if (page !== undefined && page > 0) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    } else {
      take = parseInt(process.env.PAGINATION_TAKE, 10) || 20;
      skip = 0;
    }

    const fromDate = filters?.fromDate
      ? new Date(filters?.fromDate)
      : new Date("1970-01-01");
    const toDate = filters?.toDate
      ? new Date(filters?.toDate)
      : new Date("9999-12-31");

    // Converting hotel ID to the webCode since the Ambassador commissions are mapped using webCode
    const hotel = await this.hotelService.findOne({
      where: {
        id: hotelId,
      },
    });

    // Fetching the Ambassador API token since we are using an unofficial API endpoint
    const tokenResponse = await this.httpService.request(
      `https://api.getambassador.com/v2-auth/`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: "tech@getalfred.com",
          password: process.env.AMBASSADOR_API_TOKEN,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const token = tokenData?.token;

    // Fetching the commissions data from an unofficial Ambassador API endpoint
    const response = await this.httpService.request(
      `https://api.getambassador.com/tables/content/commission/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          columns: [
            "uid",
            "is_approved",
            "approved_at",
            "referring_uid__remote_customer_email",
            "referring_name",
            "commission_amount",
            "revenue_amount",
            "affiliate_uid__remote_customer_email",
            "affiliate_name",
            "transaction_id",
            "conversion_source",
            "campaign_uid__name",
            "updated_at",
            "affiliate_uid__uid",
            "campaign_uid__uid",
            "commission_type",
            "is_flagged",
            "is_monetary",
            "is_sandbox",
            "referring_uid__uid",
            "referring_uid__custom3",
          ],
          filters: [
            {
              condition: "AND",
              filter_group: [
                {
                  field: "referring_uid__first_name",
                  negated: false,
                  operator: "icontains",
                  value: filters?.ambassador_name
                    ? filters?.ambassador_name
                    : "",
                },
              ],
            },
            {
              condition: "AND",
              filter_group: [
                {
                  field: "transaction_id",
                  negated: false,
                  operator: "icontains",
                  value: filters?.nonce ? filters?.nonce : "",
                },
              ],
            },
            {
              condition: "AND",
              filter_group: [
                {
                  field: "referring_uid__custom3",
                  negated: false,
                  operator: "icontains",
                  value: hotel?.webCode ? hotel?.webCode : "",
                },
              ],
            },
          ],
          ordering: ["-updated_at"],
        }),
      }
    );
    const commissionData = await response.json();

    const commissions = [];

    // Iterating through the commission data and fetching the corresponding order details
    for (let i = 0; i < commissionData.results.length; i++) {
      const commission = commissionData.results[i];
      const order = await this.find({
        where: {
          nonce: commission.transaction_id,
        },
      });

      // If the order is found, fetch the merchant type as it is not stored at the order level
      if (order?.length > 0) {
        const merchantType = await this.merchantService.fetchMerchantType(
          order[0].merchantId
        );

        // Determine if the order should be added based on the date filters
        const shouldAddOrder =
          !filters?.fromDate ||
          !filters?.toDate ||
          (new Date(order[0].updatedAt) >= fromDate &&
            new Date(order[0].updatedAt) <= toDate);

        if (shouldAddOrder) {
          commissions.push({
            updatedAt: order[0].updatedAt,
            merchantType: merchantType?.merchant_type,
            ...commission,
          });
        }
      } else {
        console.log(
          "Order not found for transaction_id: ",
          commission.transaction_id
        );
      }
    }

    return {
      data: commissions.slice((page - 1) * take, page * take),
      total: commissions.length,
      take,
    };
  }
}
