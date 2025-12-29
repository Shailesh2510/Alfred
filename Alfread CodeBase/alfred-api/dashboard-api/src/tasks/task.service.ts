import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import {
  AVERAGE_ORDER_PREPARATION_TIME_MINUTES,
  DEFAULT_SYSTEM_TIMEZONE,
  FRIENDLY_REMINDER_FOR_RIDE,
  PAYMENT_REMINDER_FOR_RIDE,
  PAY_LATER_ORDER_NUMBER_KEY_PREFIX,
  RIDE_CANCEL_BEFORE_MINUTES,
  SCHEDULED_ORDER_NUMBER_KEY_PREFIX,
  SCHEDULED_RIDES_ORDER_NUMBER_KEY_PREFIX,
  MIN_LEAD_TIME_FOR_REMINDER,
  getOrderNumberKey,
  getPayLaterOrderKey,
  getScheduledOrderKey,
  getScheduledRidesOrderKey,
  getTimestampDifference,
} from "helpers";
import { MerchantService } from "../merchant/merchant.service";
import { OrderService } from "../order/order.service";
import { OutOfStockService } from "src/out_of_stock/out_of_stock.service";
import { PusherService } from "src/notification/pusher.service";
import { OrderType } from "database/entities/order.entity";
import { In } from "typeorm";
import { PaymentLogService } from "src/payment/payment-log.service";
import { STRIPE_PAYMENT_INTENT_SUCCEEDED } from "../../constants";
import { CarmelService } from "src/carmel/carmel.service";
import { formatInTimeZone } from "date-fns-tz";
import { StripeService } from "src/payment/stripe.service";
import { ClicksendService } from "src/notification/clicksend.service";

@Injectable()
export class TaskService {
  logger = new Logger();
  @Inject(MerchantService)
  private readonly merchantService: MerchantService;
  @Inject(OrderService)
  private readonly orderService: OrderService;
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;
  @Inject(OutOfStockService)
  private readonly outOfStockService: OutOfStockService;
  @Inject(PusherService)
  private readonly pusherService: PusherService;
  @Inject(PaymentLogService)
  private readonly paymentLogService: PaymentLogService;
  @Inject(CarmelService)
  private readonly carmelService: CarmelService;
  @Inject(StripeService)
  private readonly stripeService: StripeService;
  @Inject(ClicksendService)
  private readonly clicksendService: ClicksendService;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: "order-number-reset-cron",
    timeZone: "America/New_York",
  })
  async resetMerchantsOrderNumber() {
    console.log("Called order-number-reset-cron");
    const merchants = await this.merchantService.find();
    const orderNumberKeys = merchants.map((merchant) =>
      getOrderNumberKey(merchant.id)
    );
    const promises = [];
    orderNumberKeys.forEach((key) => {
      promises.push(this.cacheManager.set(key, 1));
    });
    try {
      const res = await Promise.all(promises);
      console.log(`Saved order number keys ${res}`);
    } catch (err) {
      console.log(
        `Failed saving merchant order numbers from CRON ${err.message}`
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: "schedule-order-cron",
    timeZone: "America/New_York",
  })
  async lookForScheduledOrders() {
    console.log("Called schedule-order-cron");
    const keys = await this.cacheManager.store.keys();
    const scheduledOrdersKeysPromises = [];
    keys.forEach((key: string) => {
      if (key.startsWith(SCHEDULED_ORDER_NUMBER_KEY_PREFIX)) {
        scheduledOrdersKeysPromises.push(this.cacheManager.get(key));
      }
    });
    const data = await Promise.all(scheduledOrdersKeysPromises);
    const orderIdsToChangeStatus = [];
    const dequeueOrderPromises = [];
    const ccOrdersMap = {};

    data.forEach((scheduledOrderItem) => {
      if (scheduledOrderItem.orderType == OrderType.CREDIT_CARD) {
        ccOrdersMap[scheduledOrderItem.id] = scheduledOrderItem.id;
      }
    });

    if (Object.keys(ccOrdersMap).length > 0) {
      const orderPaymentLogs = await this.paymentLogService.find({
        where: {
          orderId: In(Object.keys(ccOrdersMap)),
          eventType: STRIPE_PAYMENT_INTENT_SUCCEEDED,
        },
      });
      orderPaymentLogs?.forEach((paymentLog) => {
        ccOrdersMap[paymentLog.orderId] = paymentLog.eventType;
      });
    }

    data.forEach((scheduledOrderItem) => {
      const scheduledDateTimestamp = new Date(scheduledOrderItem.scheduledDate);
      const scheduledDateTimestampUTC = Date.UTC(
        scheduledDateTimestamp.getUTCFullYear(),
        scheduledDateTimestamp.getUTCMonth(),
        scheduledDateTimestamp.getUTCDate(),
        scheduledDateTimestamp.getUTCHours(),
        scheduledDateTimestamp.getUTCMinutes(),
        scheduledDateTimestamp.getUTCSeconds()
      );

      const now = new Date(Date.now());
      const nowUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );

      const timeDiff = getTimestampDifference(
        new Date(scheduledDateTimestampUTC).getTime(),
        new Date(nowUTC).getTime()
      );

      if (
        timeDiff.daysDifference == 0 &&
        timeDiff.hoursDifference == 0 &&
        timeDiff.minutesDifference <= AVERAGE_ORDER_PREPARATION_TIME_MINUTES
      ) {
        if (scheduledOrderItem.orderType == OrderType.CREDIT_CARD) {
          if (
            ccOrdersMap[scheduledOrderItem.id] ==
            STRIPE_PAYMENT_INTENT_SUCCEEDED
          ) {
            orderIdsToChangeStatus.push(scheduledOrderItem.id);
            dequeueOrderPromises.push(
              this.cacheManager.del(getScheduledOrderKey(scheduledOrderItem.id))
            );
          }
        } else {
          orderIdsToChangeStatus.push(scheduledOrderItem.id);
          dequeueOrderPromises.push(
            this.cacheManager.del(getScheduledOrderKey(scheduledOrderItem.id))
          );
        }
      }
      //todo: need to handle deletion of orders from redis

      // if (timeDiff.daysDifference < 0) {
      //   dequeueOrderPromises.push(this.cacheManager.del(getScheduledOrderKey(scheduledOrderItem.id)))
      // }
    });

    await this.orderService.changeScheduledOrderToPending(
      orderIdsToChangeStatus
    );
    try {
      await Promise.all(dequeueOrderPromises);
    } catch (err) {
      console.log(`Failed to dequeue orders from cache: ${err.message}`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: "schedule-pay-later-order-cron",
    timeZone: "America/New_York",
  })
  async lookForScheduledPayLaterOrders(): Promise<void> {
    console.log("Called schedule-pay-later-order-cron");

    try {
      const keys = await this.cacheManager.store.keys();

      const payLaterKeys = keys.filter((key) =>
        key.startsWith(PAY_LATER_ORDER_NUMBER_KEY_PREFIX)
      );

      const rideKeys = keys.filter((key) =>
        key.startsWith(SCHEDULED_RIDES_ORDER_NUMBER_KEY_PREFIX)
      );

      if (payLaterKeys.length === 0 && rideKeys.length === 0) {
        console.log("No ride or pay-later orders found");
        return;
      }

      const payLaterOrderData = await Promise.all(
        payLaterKeys.map((key) => this.cacheManager.get(key))
      );

      const rideOrderData = await Promise.all(
        rideKeys.map((key) => this.cacheManager.get(key))
      );

      const {
        ordersToCancel,
        sendReminderToOrders,
        sendWelcomeMessage,
        sendFriendlyReminder,
        keysToDelete,
      } = this.processPayLaterOrders([
        ...(payLaterOrderData.map((p) => ({ ...p, payment: "PENDING" })) ?? []),
        ...(rideOrderData.map((p) => ({ ...p, payment: "COMPLETED" })) ?? []),
      ]);

      if (sendReminderToOrders.length > 0) {
        await this.sendSmsReminderToOrders(sendReminderToOrders);
      }
      if (sendFriendlyReminder.length > 0) {
        await this.send5minSmsReminderToOrders(sendFriendlyReminder);
      }

      if (ordersToCancel.length > 0) {
        await this.cancelOrders(ordersToCancel);
      }

      if (sendWelcomeMessage.length > 0) {
        await this.sendWelcomeMessage(sendWelcomeMessage);
      }

      console.log(`keysToDelete: ${keysToDelete}`);

      if (keysToDelete.length > 0) {
        await Promise.all(
          keysToDelete.map((key) => this.cacheManager.del(key))
        );
      }
    } catch (error) {
      console.log(
        `Failed to process scheduled pay-later orders: ${error.message}`
      );
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: "item-to-stock-cron",
    timeZone: "America/New_York",
  })
  async returnItemToStock() {
    const deleted = await this.outOfStockService.deleteAllBeforeNow();
    console.log(
      `TaskService@returnItemToStock completed with status ${deleted}`
    );
  }

  private processPayLaterOrders(orderData: any[]) {
    const ordersToCancel: any[] = [];
    const keysToDelete: string[] = [];
    const sendReminderToOrders: any[] = [];
    const sendWelcomeMessage: any[] = [];
    const sendFriendlyReminder: any[] = [];

    for (const order of orderData) {
      const timeDiff = this.calculateTimeDifference(order.scheduledDate);

      const leadTime = getTimestampDifference(
        new Date(order.scheduledDate).getTime(),
        new Date(order.createdDate).getTime()
      );

      if (order.orderType === OrderType.PAY_LATER) {
        if (
          this.shouldSendReminder(leadTime) &&
          this.reminderOrder(timeDiff) &&
          order.payment === "PENDING"
        ) {
          console.log("Order to send reminder: ", order.id);
          sendReminderToOrders.push(order);
        } else if (this.shouldCancelOrder(timeDiff)) {
          if (order.payment === "PENDING") {
            console.log("Order to cancel: ", order.id);
            ordersToCancel.push(order);
            keysToDelete.push(getPayLaterOrderKey(order.id));
          } else {
            console.log("Order to send welcome message: ", order.id);
            sendWelcomeMessage.push(order);
          }
        } else if (this.friendlyRideReminder(timeDiff)) {
          console.log("Order to send friendly reminder: ", order.id);
          sendFriendlyReminder.push(order);
        }
      } else if (this.friendlyRideReminder(timeDiff)) {
        sendFriendlyReminder.push(order);
        keysToDelete.push(getScheduledRidesOrderKey(order.id));
      }
    }

    return {
      ordersToCancel,
      sendReminderToOrders,
      sendWelcomeMessage,
      sendFriendlyReminder,
      keysToDelete,
    };
  }

  private calculateTimeDifference(scheduledDate: string) {
    const scheduledDateTime = new Date(scheduledDate).getTime();
    const timeDifference = getTimestampDifference(
      scheduledDateTime,
      new Date().getTime()
    );

    return timeDifference;
  }

  private shouldCancelOrder(timeDiff: any): boolean {
    return (
      timeDiff.daysDifference == 0 &&
      timeDiff.hoursDifference == Math.floor(RIDE_CANCEL_BEFORE_MINUTES / 60) &&
      timeDiff.minutesDifference == RIDE_CANCEL_BEFORE_MINUTES % 60
    );
  }

  private shouldSendReminder(timeDiff: any): boolean {
    return (
      timeDiff.daysDifference == 0 &&
      timeDiff.hoursDifference == Math.floor(MIN_LEAD_TIME_FOR_REMINDER / 60) &&
      timeDiff.minutesDifference >= MIN_LEAD_TIME_FOR_REMINDER % 60
    );
  }

  private reminderOrder(timeDiff: any): boolean {
    return (
      timeDiff.daysDifference == 0 &&
      timeDiff.hoursDifference == Math.floor(PAYMENT_REMINDER_FOR_RIDE / 60) &&
      timeDiff.minutesDifference == PAYMENT_REMINDER_FOR_RIDE % 60
    );
  }

  private friendlyRideReminder(timeDiff: any): boolean {
    return (
      timeDiff.daysDifference == 0 &&
      timeDiff.hoursDifference == 0 &&
      timeDiff.minutesDifference == FRIENDLY_REMINDER_FOR_RIDE % 60
    );
  }

  private async cancelOrders(orders: any[]): Promise<void> {
    console.log(`Cancelling Carmel ${JSON.stringify(orders)} pay later orders`);

    for (const order of orders) {
      try {
        await this.carmelService.cancelTrip(order.id);
      } catch (error) {
        console.log(`Failed to cancel trip ${order.id}: ${error.message}`);
      }
    }
  }

  private async sendSmsReminderToOrders(orders: any[]): Promise<void> {
    console.log(
      `Sending sms reminders to orders :  ${JSON.stringify(
        orders
      )} pay later orders`
    );

    for (const order of orders) {
      try {
        const invoiceDetails = await this.stripeService.searchInvoicesByOrderId(
          order.id
        );
        if (invoiceDetails) {
          const msg = `Reminder - please complete your payment of $${
            invoiceDetails.amount_due / 100
          } using the link below to confirm your reservation ${
            invoiceDetails.hosted_invoice_url
          }.
            Please note, if payment is not received 1 hour before your ride, it will be canceled.Thank you for choosing our service!`

          await this.clicksendService.sendSMS({
            to: invoiceDetails.customer_phone,
            message: msg,
          });

          await this.clicksendService.sendEmail({
            recipient_email: invoiceDetails.customer_email,
            recipient_name: invoiceDetails.customer_name,
            subject: `Reminder Payment Request - Upcoming Ride Booking on ${invoiceDetails.due_date}`,
            body: msg,
          });
        }
      } catch (error) {
        console.log(`Failed to cancel trip ${order.id}: ${error.message}`);
      }
    }
  }

  private async sendWelcomeMessage(orders: any[]): Promise<void> {
    console.log(`Sending welcome sms to orders :  ${JSON.stringify(orders)}`);

    for (const order of orders) {
      try {
        const invoiceDetails = await this.stripeService.searchInvoicesByOrderId(
          order.id
        );
        const currentOrder = await this.orderService.getOrderDetails(order.id);
        // We only want to send SMS if the order is not canceled and the pickup location is an airport
        if (
          currentOrder !== "CANCELED" &&
          currentOrder?.relayResponse?.Trip?.addrPu?.airport
        ) {
          const msg = `We are excited to welcome you to NY. As a reminder, once you have collected your luggage, please call +1-212-666-6666 to let us know you have arrived. A car will be there to pick you up within 5 minutes. Your confirmation number is ${currentOrder?.relayResponse?.Trip?.tripId}.` 

          await this.clicksendService.sendSMS({
            to: invoiceDetails.customer_phone,
            message: msg,
          });

          await this.clicksendService.sendEmail({
            recipient_email: invoiceDetails.customer_email,
            recipient_name: invoiceDetails.customer_name,
            subject: `Prepare for Your Upcoming Ride!`,
            body: msg,
          });
        }
      } catch (error) {
        console.log(
          `Failed to send welcome message ${order.id}: ${error.message}`
        );
      }
    }
  }

  private async send5minSmsReminderToOrders(orders: any[]): Promise<void> {
    console.log(
      `Sending 5 min sms reminders to orders :  ${JSON.stringify(orders)}`
    );

    for (const order of orders) {
      try {
        const currentOrder = await this.orderService.getOrderDetails(order.id);
        const customer_phone =
          "+" +
          currentOrder?.relayResponse?.Trip?.cust?.phone?.countryCode +
          currentOrder?.relayResponse?.Trip?.cust?.phone?.number;
        // We only want to send SMS if the order is not canceled and the pickup location is not an airport
        if (
          currentOrder.status !== "IN_DELIVERY" &&
          !currentOrder?.relayResponse?.Trip?.addrPu?.airport
        ) {
          const msg = `Your driver will be here in 5 minutes! Look for ${currentOrder?.relayResponse?.Trip?.car?.carColor} ${currentOrder?.relayResponse?.Trip?.car?.carMake}-${currentOrder?.relayResponse?.Trip?.car?.carModel} with license plate ${currentOrder?.relayResponse?.Trip?.car?.carPlateNum}.` 

          await this.clicksendService.sendSMS({
            to: customer_phone,
            message: msg,
          });

          await this.clicksendService.sendEmail({
            recipient_email: currentOrder?.relayResponse?.Trip?.cust?.emailAddr,
            recipient_name: currentOrder?.relayResponse?.Trip?.cust?.firstName,
            subject: `Your ride will be here in 5 minutes!`,
            body: msg,
          });
        }
      } catch (error) {
        console.log(`Failed to send 5 min trip ${order.id}: ${error.message}`);
      }
    }
  }
}
