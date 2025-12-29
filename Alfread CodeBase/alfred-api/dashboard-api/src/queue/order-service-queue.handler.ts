import { Inject, Injectable, Logger } from "@nestjs/common";
import { ORDER_STATUS_REPOSITORY } from "../../constants";
import { CreateOrderDTO } from "../order/dto/create-order.dto";
import { OrderService } from "../order/order.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import {
  CARMEL_TRIP_CANCEL_EVENT,
  CARMEL_TRIP_STATUS_UPDATE_EVENT,
  CLICK_SEND_REPLY_EVENT,
  ORDER_CHANNEL,
  ORDER_CREATED_EVENT,
  ORDER_RELAY_STATUS_UPDATED_EVENT,
  ORDER_SHIPDAY_STATUS_UPDATED_EVENT,
  ORDER_STATUS_UPDATED_EVENT,
  POST_ORDER_DETAILS_ON_SLACK,
  REFUND_VOUCHER_BY_ORDER,
  REPLICATE_MENU_CHANNEL,
  REPLICATE_MENU_EVENT,
  SEND_CUSTOMER_ORDER_EMAIL,
} from "../../events";
import {
  Order,
  OrderStatus,
  OrderStatusEnum,
  OrderType,
  RelayOrderStatusEnum,
  ShipdayOrderStatusEnum,
} from "database/entities/order.entity";
import { PusherService } from "src/notification/pusher.service";
import { TwilioService } from "src/notification/twilio.service";
import { Not, Repository } from "typeorm";
import { RelayService } from "src/relay/relay.service";
import { HotelService } from "src/hotel/hotel.service";
import { MerchantService } from "src/merchant/merchant.service";
import { CityService } from "src/city/city.service";
import { MailgunService } from "src/notification/mailgun.service";
import { ClicksendService } from "src/notification/clicksend.service";
import { PMSService } from "src/pms/pms.service";
import axios from "axios";
import { round } from "lodash";
import {
  areSimilarCoordinates,
  calculateTimeDifferenceInMinutes,
  displaySlackOrderCreatedAtDate,
  formatDateInUSDateFormat,
  getPayLaterOrderKey,
  getScheduledRidesOrderKey,
} from "helpers";
import { TransactionManagerService } from "src/transaction-manager/transaction-manager.service";
import { MerchantIdToRelayProducerLocationKeyMap } from "merchant-relay-plk-map";
import { ShipdayService } from "src/shipday/shipday.service";
import { ShipdayDeliveryStatus } from "src/shipday/shipday.types";
import {
  isWithInOverNightTimeRange,
  transformOrderItems,
} from "src/utils/utils";
import { AppConfigService } from "src/aws/appConfig.service";
import { CarmelTripStatusEnum } from "src/carmel/dto/carmel.types";
import { MerchantType } from "database/enums/merchantType";
import { CarmelService } from "src/carmel/carmel.service";
import { formatInTimeZone } from "date-fns-tz";
import { PaymentType } from "src/order/calculation";
import { PublishMenuService } from "src/publish-menu/publish-menu.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ClickSendMessageDto } from "src/concierge/dto/clicksend-message.dto";
import { ConciergeService } from "src/concierge/concierge.service";
import { UserType } from "database/enums/usertype";
import { ConversationsService } from "src/conversations/conversations.service";

export interface ICreateOrderQueuePayload {
  nonce: string;
  payload: CreateOrderDTO;
}

@Injectable()
export class OrderServiceQueueHandler {
  private readonly logger = new Logger();
  @Inject(OrderService)
  private readonly orderService: OrderService;
  @Inject(PusherService)
  private readonly pusherService: PusherService;
  @Inject(ShipdayService)
  private readonly shipdayService: ShipdayService;
  @Inject(TwilioService)
  private readonly twilioService: TwilioService;
  @Inject(AppConfigService)
  private readonly appConfigService: AppConfigService;
  @Inject(ORDER_STATUS_REPOSITORY)
  private readonly orderStatusRepository: Repository<OrderStatus>;
  @Inject(RelayService)
  private readonly relayService: RelayService;
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(ConversationsService)
  private readonly conversationsService: ConversationsService;
  @Inject(MerchantService)
  private readonly merchantService: MerchantService;
  @Inject(CityService)
  private readonly cityService: CityService;
  @Inject(MailgunService)
  private readonly mailgunService: MailgunService;
  @Inject(CarmelService)
  private readonly carmelService: CarmelService;
  @Inject(ClicksendService)
  private readonly clicksendService: ClicksendService;
  @Inject(PMSService)
  private readonly pmsService: PMSService;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2;
  @Inject(TransactionManagerService)
  private readonly transactionManagerService: TransactionManagerService;
  @Inject(PublishMenuService)
  private publishMenuService: PublishMenuService;
  @Inject(ConciergeService)
  private readonly conciergeService: ConciergeService;
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  async sendOrderEmail(orderId: number, status: OrderStatusEnum) {
    const order = await this.orderService.findOne({
      where: {
        id: orderId,
      },
    });
    const hotel = await this.hotelService.findOne({
      where: {
        id: order.hotelId,
      },
    });
    const orderDetails = await this.orderService.getOrderDetails(order.id);
    this.logger.log(`Event ${ORDER_CREATED_EVENT} called`);
    const emails = [
      order.clientEmail,
      hotel.contactEmail,
      "orders@getalfred.com",
    ];
    const promises = [];
    console.log(`emails: `, emails);
    for (let i = 0; i < emails.length; i++) {
      if (status == OrderStatusEnum.PENDING) {
        promises.push(
          this.mailgunService.sendEmail({
            to: emails[i],
            html: this.orderCreatedTemplate(orderDetails),
            subject: "Your order has been successfully submitted",
          })
        );
      }
      if (status == OrderStatusEnum.CANCELED) {
        promises.push(
          this.mailgunService.sendEmail({
            to: emails[i],
            html: this.orderCanceledTemplate(order),
            subject: `Your order has been canceled`,
          })
        );
      }
    }
    const promisesResponse = await Promise.all(promises);
    console.log(`email-responses: `, promisesResponse);
  }

  @OnEvent(ORDER_CREATED_EVENT, { async: true })
  async onOrderCreated(input: {
    id: number;
    nonce: string;
    version: number;
    status: OrderStatusEnum;
  }) {
    await this.pusherService.trigger(ORDER_CHANNEL, ORDER_CREATED_EVENT, {
      id: input.id,
      nonce: input.nonce,
      version: input.version,
      status: input.status,
    });
    this.logger.log(`Event ${ORDER_CREATED_EVENT} called`);
    const order = await this.orderService.findOne({
      where: {
        id: input.id,
      },
    });

    if (order.orderType == OrderType.ROOM_CHARGE) {
      if (input?.id)
        await this.sendOrderEmail(input?.id, OrderStatusEnum.PENDING);
    }
  }

  @OnEvent(SEND_CUSTOMER_ORDER_EMAIL, { async: true })
  async sendCustomerOrderEmail(input: { id: number }) {
    if (input?.id) await this.sendOrderEmail(input.id, OrderStatusEnum.PENDING);
  }

  @OnEvent(ORDER_RELAY_STATUS_UPDATED_EVENT, { async: true })
  async onOrderRelayStatusUpdated(input: {
    event: RelayOrderStatusEnum;
    externalId: string;
    orderKey: string;
  }) {
    let order = null;
    try {
      order = await this.orderService.findOne({
        where: {
          id: +input.externalId,
        },
      });
    } catch (err) {
      console.log("Order not found: ", err.message);
    }
    if (!order) {
      return;
    }
    let status = null;
    let alfredOrderStatus = null;
    switch (input.event) {
      case RelayOrderStatusEnum.RELAY_ORDER_PLACED:
        // Handle RELAY_ORDER_PLACED
        status = "RELAY_ORDER_PLACED";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_VOID:
        // Handle RELAY_ORDER_VOID
        status = "RELAY_ORDER_VOID";
        break;

      case RelayOrderStatusEnum.RELAY_RIDER_AT_PRODUCER:
        // Handle RELAY_RIDER_AT_PRODUCER
        status = "RELAY_RIDER_AT_PRODUCER";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_PICKUP_PAUSED:
        // Handle RELAY_ORDER_PICKUP_PAUSED
        status = "RELAY_ORDER_PICKUP_PAUSED";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_PICKED_UP:
        // Handle RELAY_ORDER_PICKED_UP
        status = "RELAY_ORDER_PICKED_UP";
        alfredOrderStatus = OrderStatusEnum.IN_DELIVERY;
        break;

      case RelayOrderStatusEnum.RELAY_RIDER_AT_CONSUMER:
        // Handle RELAY_RIDER_AT_CONSUMER
        status = "RELAY_RIDER_AT_CONSUMER";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_EN_ROUTE_FOR_DELIVERY:
        // Handle RELAY_ORDER_EN_ROUTE_FOR_DELIVERY
        status = "RELAY_ORDER_EN_ROUTE_FOR_DELIVERY";
        alfredOrderStatus = OrderStatusEnum.IN_DELIVERY;
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_DELIVERED:
        // Handle RELAY_ORDER_DELIVERED
        status = "RELAY_ORDER_DELIVERED";
        alfredOrderStatus = OrderStatusEnum.DELIVERED;
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_DELIVERY_FAILED:
        // Handle RELAY_ORDER_DELIVERY_FAILED
        status = "RELAY_ORDER_DELIVERY_FAILED";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_DELIVERY_RETURNED:
        // Handle RELAY_ORDER_DELIVERY_RETURNED
        status = "RELAY_ORDER_DELIVERY_RETURNED";
        break;

      case RelayOrderStatusEnum.RELAY_RIDER_ACCEPTED:
        // Handle RELAY_RIDER_ACCEPTED
        status = "RELAY_RIDER_ACCEPTED";
        break;

      case RelayOrderStatusEnum.RELAY_RIDER_CANCELLED:
        // Handle RELAY_RIDER_CANCELLED
        status = "RELAY_RIDER_CANCELLED";
        break;

      case RelayOrderStatusEnum.RELAY_RIDER_LOCATION:
        // Handle RELAY_RIDER_LOCATION
        status = "RELAY_RIDER_LOCATION";
        break;

      case RelayOrderStatusEnum.RELAY_ORDER_DETAILS_EDITED:
        // Handle RELAY_ORDER_DETAILS_EDITED
        status = "RELAY_ORDER_DETAILS_EDITED";
        break;

      default:
        // Handle the case when input.event does not match any enum value
        break;
    }

    // Saves Relay Status only
    await this.orderStatusRepository.save({
      orderId: order.id,
      orderVersion: order.version,
      status: status,
      relayResponse: input,
    });

    if (alfredOrderStatus != null) {
      await this.orderService.update(
        {
          id: order.id,
        },
        {
          status: alfredOrderStatus,
        }
      );
    }
    if (
      alfredOrderStatus == OrderStatusEnum.DELIVERED ||
      alfredOrderStatus == OrderStatusEnum.IN_DELIVERY
    ) {
      this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
        id: order.id,
        nonce: order.nonce,
        status: alfredOrderStatus,
        version: order.version,
        merchantId: order.merchant_id,
        hotelId: order.hotel_id,
        clientName: order.client_name,
        clientNumber: order.client_number,
        clientEmail: order.client_email,
        totalNet: order.total_net,
        taxAmount: order.tax_amount,
        tip: order.tip,
        grandTotal: order.grand_total,
        roomNumber: order.room_number,
        hasAlcohol: order.has_alcohol,
      });
    }
  }

  @OnEvent(ORDER_SHIPDAY_STATUS_UPDATED_EVENT, { async: true })
  async onShipdayOrderStatusUpdated(input: {
    event: ShipdayOrderStatusEnum;
    externalId: string;
    shipdayResponse: ShipdayDeliveryStatus;
  }) {
    console.log(
      `Shipday order status webhook event : ${input.event}, ${
        input.externalId
      }, ${JSON.stringify(input.shipdayResponse)}`
    );
    let order = null;
    try {
      order = await this.orderService.findOne({
        where: {
          nonce: input.externalId,
        },
      });
    } catch (err) {
      console.log("Order not found: ", err.message);
    }
    if (!order) {
      return;
    }
    let alfredOrderStatus = null;
    let status = null;
    try {
      switch (input.event) {
        case ShipdayOrderStatusEnum.NOT_ASSIGNED:
          status = "SHIPDAY_ORDER_NOT_ASSIGNED";
          break;

        case ShipdayOrderStatusEnum.NOT_ACCEPTED:
          status = "SHIPDAY_ORDER_NOT_ACCEPTED";
          break;
        case ShipdayOrderStatusEnum.NOT_STARTED_YET:
          status = "SHIPDAY_ORDER_NOT_STARTED_YET";
          break;
        case ShipdayOrderStatusEnum.STARTED:
          status = "SHIPDAY_ORDER_STARTED";
          break;
        case ShipdayOrderStatusEnum.PICKED_UP:
          status = "SHIPDAY_ORDER_PICKED_UP";
          alfredOrderStatus = OrderStatusEnum.IN_DELIVERY;
          break;
        case ShipdayOrderStatusEnum.READY_TO_DELIVER:
          status = "SHIPDAY_ORDER_READY_TO_DELIVER";
          alfredOrderStatus = OrderStatusEnum.IN_DELIVERY;
          break;
        case ShipdayOrderStatusEnum.ALREADY_DELIVERED:
          status = "SHIPDAY_ORDER_ALREADY_DELIVERED";
          alfredOrderStatus = OrderStatusEnum.DELIVERED;
          break;
        case ShipdayOrderStatusEnum.INCOMPLETE:
          status = "SHIPDAY_ORDER_INCOMPLETE";
          break;

        case ShipdayOrderStatusEnum.FAILED_DELIVERY:
          status = "SHIPDAY_ORDER_FAILED_DELIVERY";
          break;

        default:
          // Handle the case when input.event does not match any enum value
          break;
      }

      // Saves Shipday Status only
      await this.orderStatusRepository.save({
        orderId: order.id,
        orderVersion: order.version,
        status: status,
        relayResponse: input.shipdayResponse,
      });
      if (alfredOrderStatus != null) {
        await this.orderService.update(
          {
            id: order.id,
          },
          {
            status: alfredOrderStatus,
          }
        );
      }
    } catch (e) {
      console.log(JSON.stringify(e));
      console.log(`Error unable to proceed : ${e.message}`);
    }
    if (
      alfredOrderStatus == OrderStatusEnum.DELIVERED ||
      alfredOrderStatus == OrderStatusEnum.IN_DELIVERY
    ) {
      this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
        id: order.id,
        nonce: order.nonce,
        status: alfredOrderStatus,
        version: order.version,
        merchantId: order.merchant_id,
        hotelId: order.hotel_id,
        clientName: order.client_name,
        clientNumber: order.client_number,
        clientEmail: order.client_email,
        totalNet: order.total_net,
        taxAmount: order.tax_amount,
        tip: order.tip,
        grandTotal: order.grand_total,
        roomNumber: order.room_number,
        hasAlcohol: order.has_alcohol,
      });
    }
  }

  @OnEvent(CARMEL_TRIP_STATUS_UPDATE_EVENT, { async: true })
  async onCarmelTripStatusUpdated(input: {
    event: CarmelTripStatusEnum;
    carmelResponse: any;
  }) {
    console.log(
      `Carmel trip status webhook event: ${input.event}, ${JSON.stringify(
        input.carmelResponse
      )}`
    );

    let order = null;
    try {
      order = await this.orderService.findOne({
        where: {
          comment: input?.carmelResponse?.Trip?.tripId,
        },
      });
    } catch (err) {
      console.log("Order not found: ", err.message);
    }
    if (!order) {
      return;
    }
    let alfredOrderStatus = null;
    let status = null;

    try {
      switch (input.event) {
        case CarmelTripStatusEnum.ASSIGNED:
          status = "CARMEL_TRIP_ASSIGNED";
          break;

        case CarmelTripStatusEnum.UNASSIGNED:
          status = "CARMEL_TRIP_UNASSIGNED";
          break;

        case CarmelTripStatusEnum.REJECTED:
          status = "CARMEL_TRIP_REJECTED";
          break;

        case CarmelTripStatusEnum.ACCEPTED:
          status = "CARMEL_TRIP_ACCEPTED";
          break;

        case CarmelTripStatusEnum.ON_LOCATION:
          status = "CARMEL_TRIP_ON_LOCATION";
          alfredOrderStatus = OrderStatusEnum.PREPARATION;
          if (order.clientNumber) {
            const msg = `Your driver is here. Please look for  ${input.carmelResponse?.Trip?.car?.carColor} ${input.carmelResponse?.Trip?.car?.carMake}-${input.carmelResponse?.Trip?.car?.carModel} 
            with license plate ${input.carmelResponse?.Trip?.car?.carPlateNum}. Your driver is waiting for you outside.`;
            await this.clicksendService.sendSMS({
              to: order.clientNumber,
              message: msg,
            });

            await this.clicksendService.sendEmail({
              recipient_email: order.clientEmail,
              recipient_name: order.clientName,
              subject: `Your car is waiting outside`,
              body: msg,
            });
          }
          break;

        case CarmelTripStatusEnum.PICKED_UP:
          status = "CARMEL_TRIP_PICKED_UP";
          alfredOrderStatus = OrderStatusEnum.IN_DELIVERY;
          break;

        case CarmelTripStatusEnum.DROPPED_OFF:
          if (
            order.clientNumber &&
            input.carmelResponse?.method === "notifyClosing"
          ) {
            status = "CARMEL_TRIP_DROPPED_OFF";
            alfredOrderStatus = OrderStatusEnum.DELIVERED;

            const msg = `
            Thank you for booking with Alfred. We value your feedback.
             Please leave us a review here : https://delighted.com/t/jEV04rHK?name=${encodeURIComponent(
               order.clientName
             )}&order_id=${order.nonce}.
           `;

            await this.clicksendService.sendSMS({
              to: order.clientNumber,
              message: msg,
            });

            await this.clicksendService.sendEmail({
              recipient_email: order.clientEmail,
              recipient_name: order.clientName,
              subject: `Thanks for Riding with Us! Tell Us About Your Experience`,
              body: msg,
            });
          }
          break;

        case CarmelTripStatusEnum.CANCELED:
          status = "CARMEL_TRIP_CANCELED";
          alfredOrderStatus = OrderStatusEnum.CANCELED;
          break;

        case CarmelTripStatusEnum.NO_SHOW:
          status = "CARMEL_TRIP_NO_SHOW";
          alfredOrderStatus = OrderStatusEnum.CANCELED;
          break;

        case CarmelTripStatusEnum.MODIFIED:
          status = "CARMEL_TRIP_MODIFIED";
          break;

        default:
          console.log(`Unexpected trip status: ${input.event}`);
          break;
      }

      await this.orderStatusRepository.save({
        orderId: order.id,
        orderVersion: order.version,
        status: status,
        relayResponse: input.carmelResponse,
      });

      await this.orderService.update(
        { id: order.id },
        { status: alfredOrderStatus || order.status }
      );
      if (alfredOrderStatus != null) {
        this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
          id: order.id,
          nonce: order.nonce,
          status: alfredOrderStatus,
          version: order.version,
          merchantId: order.merchantId,
          hotelId: order.hotelId,
          clientName: order.clientName,
          clientNumber: order.clientNumber,
          clientEmail: order.clientEmail,
          totalNet: order.totalNet,
          taxAmount: order.taxAmount,
          tip: order.tip,
          grandTotal: order.grandTotal,
          roomNumber: order.roomNumber,
          hasAlcohol: order.hasAlcohol,
        });
      }
    } catch (e) {
      this.logger.error(`Error processing trip status: ${e.message}`);
    }
  }

  @OnEvent(CARMEL_TRIP_CANCEL_EVENT, { async: true })
  async cancelCarmelTrip(input: { nonce: string; orderId: number }) {
    await this.carmelService.cancelTrip(input?.orderId);
    try {
      await this.cacheManager.del(getPayLaterOrderKey(input?.orderId));
      await this.cacheManager.del(getScheduledRidesOrderKey(input?.orderId));
    } catch (err) {
      this.logger.debug(`cancelOrder@cachemanager.del ${err.message}`);
    }
  }

  @OnEvent(REPLICATE_MENU_EVENT, { async: true })
  async replicateMenuToHotels(input: {
    sourceHotelId: number;
    targetHotelIds: number[];
    merchantIds: number[];
  }) {
    const propagationResult =
      await this.publishMenuService.propagateMenuConfiguration(
        input.sourceHotelId,
        input.targetHotelIds,
        input.merchantIds
      );
    await this.pusherService.trigger(
      REPLICATE_MENU_CHANNEL,
      REPLICATE_MENU_EVENT,
      {
        data: propagationResult.data,
      }
    );
  }

  @OnEvent(ORDER_STATUS_UPDATED_EVENT, { async: true })
  async onOrderStatusChange(input: {
    id: number;
    nonce: string;
    status: OrderStatusEnum;
    version: number;
    merchantId: number;
    hotelId: number;
    clientName: string;
    clientNumber: string;
    clientEmail: string;
    totalNet: number;
    taxAmount: number;
    tip: number;
    grandTotal: number;
    roomNumber: string;
    hasAlcohol?: boolean;
  }) {
    console.log(
      `Event ${ORDER_STATUS_UPDATED_EVENT} called with input: ${JSON.stringify(
        input
      )}`
    );
    const isShipdayAllDayDeliveryEnabled =
      await this.appConfigService.fetchFeatureFlagValue(
        "enable_shipday_all_day_delivery"
      );
    await this.pusherService.trigger(
      ORDER_CHANNEL,
      ORDER_STATUS_UPDATED_EVENT,
      {
        id: input.id,
        nonce: input.nonce,
        status: input.status,
      }
    );
    let relayResponse = null;
    const order = await this.orderService.findOne({
      where: {
        nonce: input.nonce,
      },
    });

    const merchantDetails = await this.merchantService.fetchMerchantType(
      input.merchantId
    );

    const isRideMerchant =
      merchantDetails?.merchant_type === MerchantType.RIDES;

    let tripDetails = null;
    let tripId = null;

    if (isRideMerchant) {
      tripDetails = await this.carmelService.getTrip(order.id);
      tripId = tripDetails?.data?.tripId;
    }

    const orderUuid = order.nonce;
    const consumerTrackingUrl =
      process.env.NODE_ENV == "prod"
        ? `https://app.getalfred.com/order-status/${orderUuid}`
        : `https://app-${process.env.NODE_ENV}.getalfred.com/order-status/${orderUuid}`;

    if (input.status == OrderStatusEnum.CANCELED) {
      if (!isRideMerchant) {
        const orderStatus = await this.orderStatusRepository.findOne({
          where: {
            orderId: input.id,
            relayResponse: Not("null"),
            status: Not(OrderStatusEnum.PREPARATION),
          },
        });
        console.log("order-status: ", JSON.stringify(orderStatus));
        const shipDayOrderDetails = await this.shipdayService.getOrderDetails(
          orderUuid
        );
        const relayOrderKey =
          orderStatus?.relayResponse?.order?.orderKey ??
          orderStatus?.relayResponse?.orderKey;
        if (shipDayOrderDetails.length > 0 && shipDayOrderDetails[0].orderId) {
          console.log(`-------------SHIPDAY CANCEL ORDER-----------------`);
          const response = await this.shipdayService.deleteOrder(input.nonce);
          console.log(
            `shipday-cancel-order-response: ${input.nonce} `,
            response
          );
          console.log(`-------------SHIPDAY CANCEL ORDER-----------------`);
        }
        if (relayOrderKey) {
          console.log(`-------------RELAY CANCEL ORDER-----------------`);
          const response = await this.relayService.cancelOrder(relayOrderKey);
          console.log(`relay-concel-order-response: ${input.nonce}`, response);
          console.log(`-------------RELAY CANCEL ORDER-----------------`);
        }
      }

      if (input?.id)
        await this.sendOrderEmail(input.id, OrderStatusEnum.CANCELED);
      if (order.clientNumber && !isRideMerchant) {
        await this.clicksendService.sendSMS({
          to: order.clientNumber,
          message: `
          Your order has been canceled
          ${consumerTrackingUrl}
        `,
        });
      } else {
        if (order.clientNumber) {
          const msg = `Your Ride ${tripId} with Alfred has been canceled.`;
          await this.clicksendService.sendSMS({
            to: order.clientNumber,
            message: msg,
          });

          await this.clicksendService.sendEmail({
            recipient_email: order.clientEmail,
            recipient_name: order.clientName,
            subject: `Your car is canceled for ${tripId}`,
            body: msg,
          });
        }
      }
    }
    if (input.status === OrderStatusEnum.SCHEDULED && isRideMerchant) {
      const { clientNumber, orderType, id, scheduledDate } = order;

      const sendDriverNotification = async () => {
        let msg = `Thank you for booking with Alfred, your confirmation number is ${tripId}. Your driver will meet you on ${formatInTimeZone(
          scheduledDate,
          "America/New_York",
          "MMMM d, yyyy 'at' hh:mm aa"
        )}.`;

        if (tripDetails?.data?.addrPu?.airport) {
          msg = `${msg} Once you have arrived at the airport and claimed your bag, please call us at +1-212-666-6666 to let us know you have arrived. A car will be there to pick you up within 5 minutes. We will use your flight information to track for any delays and adjust the pickup time accordingly. For all other inquiries, including ride cancellations or changes, please call us at +1-844-738-0342.`;
        } else {
          msg = `${msg} Once your car has arrived, we will send you a text with the details of your car. If you cannot find the driver upon arrival, please call us at +1-212-666-6666. For all other inquiries, including ride cancellations or changes, please call us at +1-844-738-0342.`;
        }

        await this.clicksendService.sendSMS({
          to: clientNumber,
          message: msg,
        });

        await this.clicksendService.sendEmail({
          recipient_email: order.clientEmail,
          recipient_name: order.clientName,
          subject: `Ride Booking Details for ${formatInTimeZone(
            scheduledDate,
            "America/New_York",
            "MMMM d, yyyy 'at' hh:mm aa"
          )}`,
          body: msg,
        });
      };

      if (clientNumber && orderType !== PaymentType.PAY_LATER) {
        await sendDriverNotification();
      } else {
        const paymentLog =
          await this.orderService.fetchSuccessfulPaymentLogByOrderId(+id);

        if (paymentLog) {
          await sendDriverNotification();
        }
      }
    }
    if (input.status == OrderStatusEnum.IN_DELIVERY && !isRideMerchant) {
      const orderStatus = await this.orderStatusRepository.findOne({
        where: {
          orderId: input.id,
          relayResponse: Not("null"),
        },
      });
      const relayOrderKey =
        orderStatus?.relayResponse?.order?.orderKey ??
        orderStatus?.relayResponse?.orderKey;
      if (relayOrderKey) {
        await this.relayService.toggleOrderReady({
          orderKey: relayOrderKey,
          isReady: true,
        });
      }
      if (order.clientNumber) {
        await this.clicksendService.sendSMS({
          to: order.clientNumber,
          message: `
            Your order is in delivery.
            You can track your order on this link
            ${consumerTrackingUrl}
          `,
        });
      }
    }
    if (input.status == OrderStatusEnum.PREPARATION && !isRideMerchant) {
      const merchant = await this.merchantService.findOne({
        where: {
          id: input.merchantId,
        },
      });
      const hotel = await this.hotelService.findOne({
        where: {
          id: input.hotelId,
        },
      });
      let orderDeliveryFailed = false;
      // Merchant and Hotel need to have 3rd party delivery enabled, and the coordinates should be different, for the order to be delivered by a 3rd party
      if (
        merchant?.hasThirdPartyDelivery &&
        hotel?.hasThirdPartyDelivery &&
        !areSimilarCoordinates(hotel?.coordinates, merchant?.coordinates)
      ) {
        const relayQuote = await this.relayService.getQuote(
          merchant.id,
          hotel.webCode
        );
        const canRelayDeliverToAddress = "quote" in relayQuote ? true : false;
        console.log(
          `Can relay deliver to address: ${canRelayDeliverToAddress}`
        );
        if (
          isWithInOverNightTimeRange(
            isShipdayAllDayDeliveryEnabled,
            order.updatedAt
          ) ||
          !canRelayDeliverToAddress
        ) {
          console.log("TriggeredShipdayOrder");
          relayResponse = await this.createShipdayOrder({
            orderId: input.id,
            orderNonce: orderUuid,
            hotelId: input.hotelId,
            merchantId: input.merchantId,
            clientName: input.clientName,
            clientNumber: input.clientNumber, // isUSPhoneNumber(input.clientNumber) ? input.clientNumber : GX_PHONE_NUMBER,
            clientEmail: input.clientEmail,
            totalNet: input.totalNet,
            taxAmount: input.taxAmount,
            tip: input.tip,
            grandTotal: input.grandTotal,
            roomNumber: input.roomNumber,
            hasAlcohol: input.hasAlcohol ?? false,
            orderDetails: order,
          });
        } else {
          console.log("TriggeredRelayOrder");
          relayResponse = await this.createRelayOrder({
            orderId: input.id,
            hotelId: input.hotelId,
            merchantId: input.merchantId,
            clientName: input.clientName,
            clientNumber: input.clientNumber, // isUSPhoneNumber(input.clientNumber) ? input.clientNumber : GX_PHONE_NUMBER,
            totalNet: input.totalNet,
            taxAmount: input.taxAmount,
            tip: input.tip,
            grandTotal: input.grandTotal,
            roomNumber: input.roomNumber,
            hasAlcohol: input.hasAlcohol ?? false,
          });
        }
        console.log(
          `Third party response for ${input.nonce}`,
          JSON.stringify(relayResponse)
        );

        if (relayResponse.success == false) {
          await this.orderService.cancelOrder(
            order.id,
            order.hotelId,
            order.merchantId,
            {
              reason: `Relay service order creation failed`,
              option: `${relayResponse.message}`,
              version: order.version,
            }
          );
          orderDeliveryFailed = true;
        }
      }
    }
    if (input.status == OrderStatusEnum.DELIVERED && !isRideMerchant) {
      // schedule an email/sms that wishes client a happy meal
      if (order.clientNumber) {
        await this.clicksendService.sendSMS({
          to: order.clientNumber,
          message: `
          Your order has been delivered. 
          Thanks for choosing Alfred! 
          We value your feedback. 
          Please leave us a review here https://delighted.com/t/jEV04rHK?name=${encodeURIComponent(
            input.clientName
          )}&order_id=${input.nonce}.
        `,
        });
      }
    }
    if (input.status == OrderStatusEnum.CONFIRMED && !isRideMerchant) {
      // schedule an email/sms that wishes client a happy meal
      if (order.clientNumber) {
        await this.clicksendService.sendSMS({
          to: order.clientNumber,
          message: `
          Thank you for ordering with us.
          You can track your order on the link below.
          ${consumerTrackingUrl}
        `,
        });
      }
      if (order.orderType == OrderType.ROOM_CHARGE) {
        // send order to pms
        // const hotel: Hotel = await this.hotelService.findOne({
        //   where: {
        //     id: input.hotelId,
        //   }
        // })
        const orderItems = await this.orderService.getOrderItems(input.id);
        await this.pmsService.postToPms("BHOME", orderItems, order);
      }
    }
    await this.orderStatusRepository.save({
      orderId: input.id,
      orderVersion: input.version,
      status: input.status,
      relayResponse: relayResponse,
    });

    if (input.status == OrderStatusEnum.DELIVERED) {
      // Post in #order-tracker channel on Slack
      this.eventEmitter.emit(POST_ORDER_DETAILS_ON_SLACK, {
        orderNonce: order.nonce,
      });
    }
  }

  @OnEvent(POST_ORDER_DETAILS_ON_SLACK, { async: true })
  async postOrderStatusOnSlack(input: { orderNonce: string }) {
    this.logger.log(
      `Event ${POST_ORDER_DETAILS_ON_SLACK} called with input: ${JSON.stringify(
        input
      )}`
    );
    try {
      const orderDetails = await this.orderService.getSlackOrderDetails(
        input.orderNonce
      );

      const orderDetail = orderDetails[0];

      console.log(`order-details: `, JSON.stringify(orderDetails));

      const pendingTime = calculateTimeDifferenceInMinutes(
        orderDetails.find((o: any) => o.os_status === OrderStatusEnum.CONFIRMED)
          ?.os_created_at,
        orderDetails.find((o: any) => o.os_status === OrderStatusEnum.PENDING)
          ?.os_created_at
      );
      const preparationTime = calculateTimeDifferenceInMinutes(
        orderDetails.find(
          (o: any) => o.os_status === OrderStatusEnum.IN_DELIVERY
        )?.os_created_at,
        orderDetails.find(
          (o: any) => o.os_status === OrderStatusEnum.PREPARATION
        )?.os_created_at
      );

      const deliveryTime = calculateTimeDifferenceInMinutes(
        orderDetails.find((o: any) => o.os_status.includes("DELIVERED"))
          ?.os_created_at,
        orderDetails.find(
          (o: any) => o.os_status === OrderStatusEnum.IN_DELIVERY
        )?.os_created_at
      );

      const overallTime =
        (pendingTime || 0) + (preparationTime || 0) + (deliveryTime || 0);

      const message = {
        orderId: orderDetail.os_order_id,
        orderNonce: orderDetail.order_nonce,
        clientName: orderDetail.order_clientname,
        clientNumber: orderDetail.order_clientnumber,
        roomNumber: orderDetail.order_roomnumber,
        scheduledDate: orderDetail.order_scheduleddate,
        createdAt: orderDetail.order_createdat,
        grandTotal: round(orderDetail.order_grandtotal, 2),
        pendingTime: pendingTime,
        preparationTime: preparationTime,
        deliveryTime: deliveryTime,
        overallTime: overallTime,
        voucherAmount: parseFloat(orderDetail.order_voucher_amount),
        voucherType: orderDetail.voucher_type ?? `NA`,
        voucherPayer: orderDetail.voucher_payer ?? `NA`,
        hotelName: orderDetail.hotel_name,
        merchantName: orderDetail.merchant_name,
      };

      await axios.post(
        "${process.env.SLACK_WEBHOOK_URL || ""}",
        this.buildSlackPayload(message)
      );
    } catch (error) {
      this.logger.error(
        `Error occurred while posting order status on slack: ${error}`
      );
    }
  }

  private buildSlackPayload(message: any) {
    const isProd = process.env.NODE_ENV.toLowerCase() == `prod`;
    const {
      orderId,
      orderNonce,
      clientName,
      clientNumber,
      roomNumber,
      scheduledDate,
      createdAt,
      grandTotal,
      pendingTime,
      preparationTime,
      deliveryTime,
      overallTime,
      voucherAmount,
      voucherType,
      voucherPayer,
      hotelName,
      merchantName,
    } = message;
    const slackMessage = {
      channel: isProd ? "order-tracker" : "test-message",
      username: "TrackBot",
      icon_emoji: ":bell:",
      blocks: [
        {
          type: "section",
          block_id: "order_details",
          text: {
            type: "mrkdwn",
            text: `*Please find Order's ${orderNonce} details below:*`,
          },
        },
        {
          type: "section",
          block_id: "order_id",
          text: {
            type: "mrkdwn",
            text: `*Order ID:* ${orderNonce}`,
          },
        },
        {
          type: "section",
          block_id: "guest_name",
          text: {
            type: "mrkdwn",
            text: `*Name of the Guest:* ${clientName}`,
          },
        },
        {
          type: "section",
          block_id: "phone_number",
          text: {
            type: "mrkdwn",
            text: `*Phone Number:* ${clientNumber}`,
          },
        },
        {
          type: "section",
          block_id: "hotel_name",
          text: {
            type: "mrkdwn",
            text: `*Hotel Name:* ${hotelName}`,
          },
        },
        {
          type: "section",
          block_id: "room_number",
          text: {
            type: "mrkdwn",
            text: `*Room Number:* ${roomNumber}`,
          },
        },
        {
          type: "section",
          block_id: "merchant_name",
          text: {
            type: "mrkdwn",
            text: `*Merchant Name:* ${merchantName}`,
          },
        },
        {
          type: "section",
          block_id: "order_placed_at",
          text: {
            type: "mrkdwn",
            text: `*Order placed at:* ${displaySlackOrderCreatedAtDate(
              new Date(scheduledDate ?? createdAt)
            )}`,
          },
        },
        {
          type: "section",
          block_id: "pending_time",
          text: {
            type: "mrkdwn",
            text: `*Pending time:* ${pendingTime.toFixed(2)} mins`,
          },
        },
        {
          type: "section",
          block_id: "preparation_time",
          text: {
            type: "mrkdwn",
            text: `*In Preparation time:* ${preparationTime.toFixed(2)} mins`,
          },
        },
        {
          type: "section",
          block_id: "delivery_time",
          text: {
            type: "mrkdwn",
            text: `*Delivery time:* ${deliveryTime.toFixed(2)} mins`,
          },
        },
        {
          type: "section",
          block_id: "overall_time",
          text: {
            type: "mrkdwn",
            text: `*Overall time:* ${overallTime.toFixed(2)} mins`,
          },
        },
        {
          type: "section",
          block_id: "voucher_amount",
          text: {
            type: "mrkdwn",
            text: `*Voucher Amount:* ${
              voucherAmount != 0 ? `$${voucherAmount.toFixed(2)}` : `NA`
            }`,
          },
        },
        {
          type: "section",
          block_id: "voucher_Type",
          text: {
            type: "mrkdwn",
            text: `*Voucher Type:* ${voucherType}`,
          },
        },
        {
          type: "section",
          block_id: "voucher_payer",
          text: {
            type: "mrkdwn",
            text: `*Voucher Payer:* ${voucherPayer}`,
          },
        },
        {
          type: "section",
          block_id: "total_price",
          text: {
            type: "mrkdwn",
            text: `*Total Price:* $${grandTotal.toFixed(2)}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Go to order ${orderNonce} : <https://admin${
                isProd ? "" : "-dev"
              }.getalfred.com/order-list/${orderId}|Link>`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
    };
    return slackMessage;
  }

  @OnEvent(REFUND_VOUCHER_BY_ORDER, { async: true })
  async refundVoucherByOrder(
    input: {
      order_id: number;
      existing_refund_amount: number;
      applied_voucher_amount: number;
      voucher_code_id: number;
    }[]
  ) {
    try {
      for (const iterator of input) {
        const {
          order_id,
          existing_refund_amount,
          applied_voucher_amount,
          voucher_code_id,
        } = iterator;

        await this.transactionManagerService.executeInTransaction(
          async (queryRunner) => {
            await this.orderService.processOrderRefund(
              order_id,
              existing_refund_amount,
              applied_voucher_amount,
              applied_voucher_amount,
              voucher_code_id,
              queryRunner
            );
          }
        );
      }
    } catch (error) {
      console.log("error@refundVoucherByOrder ", error);
    }
  }

  private async createShipdayOrder(input: {
    orderId: number;
    hotelId: number;
    orderNonce: string;
    merchantId: number;
    clientName: string;
    clientNumber: string;
    clientEmail: string;
    totalNet: number;
    taxAmount: number;
    tip: number;
    grandTotal: number;
    roomNumber: string;
    hasAlcohol?: boolean;
    orderDetails: any;
  }) {
    try {
      const hotel = await this.hotelService.findOne({
        where: {
          id: input.hotelId,
        },
      });
      const merchant = await this.merchantService.findOne({
        where: {
          id: input.merchantId,
        },
      });
      const city = await this.cityService.findOne({
        where: {
          id: merchant.cityId,
        },
      });

      const order = await this.orderService.getOrderItems(input.orderId);

      const listOfOrderItems = transformOrderItems(order);

      const producerLocation = `${merchant.addressNumber} ${merchant.addressStreet}, ${city.name}, ${city.state}, ${merchant.addressZipCode}`;

      const roomNumber = input.roomNumber ? `${input.roomNumber}` : null;
      const consumerLocation = `${hotel.addressNumber} ${hotel.addressStreet}, ${city.name}, ${city.state}, ${hotel.addressZipCode}`;

      const orderInfoPayload = {
        orderNumber: input.orderNonce,
        customerName: input.clientName,
        customerAddress: consumerLocation,
        customerEmail: input.clientEmail,
        customerPhoneNumber: process.env.GX_PHONE_NUMBER,
        restaurantName: merchant.name,
        restaurantAddress: producerLocation,
        pickupLatitude: merchant.coordinates.x,
        pickupLongitude: merchant.coordinates.y,
        deliveryLatitude: hotel.coordinates.x,
        deliveryLongitude: hotel.coordinates.y,
        deliveryInstruction: `Please display Alfred-branded bags to Hotel front desk. Deliver to  guest's room number ${roomNumber}${
          input.hasAlcohol ? ".\nOrder contains alcohol, please scan ID" : "."
        }`,
        orderItem: listOfOrderItems,
        tips: input.orderDetails?.tip,
      };

      console.log(
        `Shipday Payload: ${input.orderNonce}`,
        JSON.stringify(orderInfoPayload)
      );
      const shipdayResponse = await this.shipdayService.insertOrder(
        orderInfoPayload
      );
      console.log(
        `Shipday-response: ${input.orderNonce} `,
        JSON.stringify(shipdayResponse)
      );

      const getDeliveryOptions = await this.shipdayService.checkAvailability(
        hotel.webCode,
        merchant.id
      );

      console.log(
        `Delivery Options are for ${input.orderNonce} :`,
        JSON.stringify(getDeliveryOptions)
      );

      if (getDeliveryOptions && getDeliveryOptions.name) {
        await this.shipdayService.assignToOnDemand(
          getDeliveryOptions?.name,
          input.orderNonce
        );
      }

      return shipdayResponse;
    } catch (e) {
      console.log(JSON.stringify(e));
      console.log(`Error unable to proceed : ${e.message}`);
    }
  }

  private async createRelayOrder(input: {
    orderId: number;
    hotelId: number;
    merchantId: number;
    clientName: string;
    clientNumber: string;
    totalNet: number;
    taxAmount: number;
    tip: number;
    grandTotal: number;
    roomNumber: string;
    hasAlcohol?: boolean;
  }) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: input.hotelId,
      },
    });
    const merchant = await this.merchantService.findOne({
      where: {
        id: input.merchantId,
      },
    });
    const city = await this.cityService.findOne({
      where: {
        id: merchant.cityId,
      },
    });
    const producerLocation = {
      address1: `${merchant.addressNumber} ${merchant.addressStreet}`,
      city: city.name,
      state: city.state,
      zip: merchant.addressZipCode,
    };
    const roomNumber = input.roomNumber ? `${input.roomNumber}` : null;
    const consumerLocation = {
      address1:
        process.env.NODE_ENV == `prod`
          ? `${hotel.addressNumber} ${hotel.addressStreet}`
          : `125 W 31st st`,
      city: process.env.NODE_ENV == `prod` ? city.name : `New York`,
      state: process.env.NODE_ENV == `prod` ? city.state : `NY`,
      zip: process.env.NODE_ENV == `prod` ? hotel.addressZipCode : `10017`,
      ...(roomNumber ? { apartment: roomNumber } : null),
    };
    let producerLocationKey =
      MerchantIdToRelayProducerLocationKeyMap[input.merchantId];

    const relayPayload = {
      order: {
        requireReadyEvent: true,
        externalId: `${input.orderId}`,
        consumer: {
          name: input.clientName ?? hotel.name,
          phone: input.clientNumber,
          location: consumerLocation,
          proof: {
            idScan: input.hasAlcohol ?? false,
          },
        },
        producer: {
          name: merchant.name,
          phone: merchant.contactPhone,
          ...(process.env.NODE_ENV == `prod`
            ? {
                location: producerLocation,
              }
            : null),
          ...{
            producerLocationKey: producerLocationKey,
          },
        },
        price: {
          subTotal: +input.grandTotal,
          tip: +input.tip,
          // ...(input.taxAmount ? {tax: +input.taxAmount} : null)
        },
        ...(hotel.deliveryInstructions
          ? { specialInstructions: hotel.deliveryInstructions }
          : null),
      },
    };
    const relayResponse = await this.relayService.createOrder(relayPayload);

    console.log(`relay-response: `, JSON.stringify(relayResponse));
    console.log(`relayPayload: `, JSON.stringify(relayPayload));
    return relayResponse;
  }

  orderCreatedTemplate(orderDetails: any) {
    let itemsTableRow = "";
    orderDetails.items.forEach((item) => {
      let modifiersRows = "";
      item.modifiers?.forEach((modifier) => {
        modifier.options?.forEach((option) => {
          modifiersRows += `
            <li><span>${option.modifierName}/${option.modifierOptionName}</span><span>${option.quantity}</span><span>$${option.price}</span></li>
          `;
        });
      });
      itemsTableRow += `
        <tr>
          <td>${item.itemName}</td>
          <td class="modifiers">
            <ul>
              ${modifiersRows}
            </ul>
          </td>
          <td>${item.quantity}</td>
          <td>$${Number(item.price).toFixed(2)}</td>
          <td>$${Number(Number(item.price) * Number(item.quantity)).toFixed(
            2
          )}</td>
        </tr>
      `;
    });
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alfred Tech Food Order</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
    
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
    
            th,
            td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
    
            .title {
                font-size: 25px;
            }
    
            .track-button {
                background-color: #008CBA;
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
    
            .logo {
                margin-top: 10;
            }
    
            .thank-you {
                margin-top: 30px;
                margin-bottom: 50px;
    
            }
            .track-instruction,
            .contact-info {
                margin-top: 30px;
            }
    
            .modifiers ul {
                padding-left: 0;
                list-style-type: none;
            }
    
            .modifiers li {
                display: flex;
                justify-content: space-between;
            }
    
            .financial-summary {
                text-align: right;
            }
    
            .button-container {
                text-align: center;
                padding: 20px;
            }
        </style>
    </head>
    
    <body>
    
        <img src="https://${
          process.env.NODE_ENV == "prod" ? "app" : "app-dev"
        }.getalfred.com/get-alfred.svg" alt="Alfred Tech Logo" class="logo" />
    
        <h1 class="title">Alfred Tech Food Order</h1>
    
        <p class="thank-you">Thank you for ordering with Alfred Tech! We appreciate your business and hope you enjoy your
            meal. If you have any questions or need assistance with your order, please feel free to contact us.</p>
    
        <table>
            <tr>
                <th>Item</th>
                <th>Modifier</th>
                <th>Quantity</th>
                <th>Item Price</th>
                <th>Total</th>
            </tr>
            ${itemsTableRow}
        </table>
        <div>
            <p><strong>Comment:</strong>${orderDetails.comment}</p>
        </div>
    
        <div class="financial-summary">
            <p><strong>Financial Summary:</strong></p>
            <p>Receipt amount: $${Number(orderDetails.receiptAmount).toFixed(
              2
            )}</p>
            <p>Net: $${Number(orderDetails.totalNet).toFixed(2)}</p>
            <p>Tax: $${Number(orderDetails.taxAmount).toFixed(2)}</p>
            <p>Tip: $${Number(orderDetails.tip).toFixed(2)}</p>
            <p>Delivery fee: $${Number(orderDetails.deliveryFee).toFixed(2)}</p>
            <p><strong>Total: $${Number(orderDetails.grandTotal).toFixed(
              2
            )}</strong></p>
        </div>
    
        <p class="track-instruction">
          You can track the status of your order by clicking the button below. We will keep you updated with the real-time progress of your order until it reaches you.
        </p>
    
        <div class="button-container">
            <button class="track-button">
              <a href="https://${
                process.env.NODE_ENV == "prod" ? "app" : "app-dev"
              }.getalfred.com/order/${orderDetails.nonce}?orderStatus=success">
                Track Order Status
              </a>
            </button>
            </p>
            <p class="contact-info">
              <strong>Contact Alfred Tech:</strong><br>
              Email: support@alfredtech.com<br>
              Phone: (123) 456-7890<br>
              Address: 123 Main St, Tech City, AT 12345
            </p>
    
    </body>
    
    </html>`;
  }

  orderCanceledTemplate(order: Order) {
    const canceledOption = order.cancelOption;
    const canceledReason = order.cancelReason;
    const orderId = order.nonce;
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alfred Tech Food Order</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .title {
            font-size: 25px;
        }

        .track-button {
            background-color: #008CBA;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .logo {
            margin-top: 10;
        }

        .thank-you {
            margin-top: 30px;
            margin-bottom: 50px;

        }
        .track-instruction,
        .contact-info {
            margin-top: 30px;
        }

        .modifiers ul {
            padding-left: 0;
            list-style-type: none;
        }

        .modifiers li {
            display: flex;
            justify-content: space-between;
        }

        .financial-summary {
            text-align: right;
        }

        .button-container {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>

<body>

    <img src="https://www.getalfredapp.com/get-alfred.svg" alt="Alfred Tech Logo" class="logo" />

    <h1 class="title">Your Order is cancelled</h1>

    <p class="track-instruction">Order ID: ${orderId}</p>
    <br />
    <p class="track-instruction">Cancel reason: ${canceledOption}</p>
    <p class="track-instruction">Coment: ${canceledReason}</p>

    <div class="button-container">
        <p class="contact-info">
            <strong>Contact Alfred Tech:</strong><br>
            Email: support@alfredtech.com<br>
            Phone: (123) 456-7890<br>
            Address: 123 Main St, Tech City, AT 12345
        </p>

</body>

</html>
    `;
  }

  @OnEvent(CLICK_SEND_REPLY_EVENT, { async: true })
  async fetchHotelDetailsFromClickSendReplyNumber(
    clickSendResponse: ClickSendMessageDto
  ) {
    let response = {};

    // Fetch check-in details using the sender's phone number
    const checkInDetails = await this.conciergeService.fetchCheckInDetails(
      clickSendResponse.from
    );

    console.log(`Check in Details : ${JSON.stringify(checkInDetails)}`);

    const hotel = checkInDetails?.hotel;

    const queuePayload = {
      message: clickSendResponse.message,
      sessionId: clickSendResponse.from,
      guest: {
        name: checkInDetails
          ? `${checkInDetails.firstName} ${checkInDetails.lastName}`
          : "",
        checkInDate: checkInDetails?.arrivalDate
          ? formatDateInUSDateFormat(checkInDetails.arrivalDate)
          : "",
        checkOutDate: checkInDetails?.departureDate
          ? formatDateInUSDateFormat(checkInDetails.departureDate)
          : "",
        hotelWebCode: hotel?.webCode || "",
        hotelName: hotel?.name || "",
        email: checkInDetails?.email || "",
        lastMessage: clickSendResponse.originalmessage,
      },
    };

    // Construct response if check-in details exist
    if (checkInDetails && hotel) {
      response = {
        name: `${checkInDetails.firstName} ${checkInDetails.lastName}`,
        phone: clickSendResponse.from,
        hotelName: hotel.name,
        checkInDate: checkInDetails.arrivalDate,
      };
    }

    // Construct conversation payload
    const conversationsPayload = {
      user_id: checkInDetails?.id || null,
      session_id: clickSendResponse.from,
      message: clickSendResponse.message,
      role: UserType.GUEST_USER,
      vote: false,
    };

    // Create conversation record
    const conversation = await this.conversationsService.create(
      conversationsPayload
    );

    console.log(`Queue Payload : ${JSON.stringify(queuePayload)}`);

    // Send the message to the queue (always executed)
    await this.conciergeService.sendMessageToQueue(queuePayload);

    console.log(response, conversation, "response");
  }
}
