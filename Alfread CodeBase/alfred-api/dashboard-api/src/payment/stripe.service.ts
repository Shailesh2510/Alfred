import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { STRIPE_DEFAULT_SYSTEM_CURRENCY } from "../../constants";
import { Stripe } from "stripe";
import {
  getAdminOrderUrl,
  getPayLaterOrderKey,
  getScheduledRidesOrderKey,
  toDollars,
} from "helpers";
import { subDays, subMinutes } from "date-fns";
import { Cache } from "cache-manager";
import { OrderService } from "src/order/order.service";
import { OrderType } from "database/entities/order.entity";
import { ClicksendService } from "src/notification/clicksend.service";
import { ReferralService } from "src/referrals/referral.service";

export class StripeSingleton {
  private static instance = null;
  static getInstance(): Stripe {
    const apiKey = process.env.STRIPE_API_KEY;
    if (StripeSingleton.instance == null) {
      StripeSingleton.instance = new Stripe(apiKey, {
        apiVersion: "2022-11-15",
      });
    }
    return StripeSingleton.instance;
  }
}

export type PaymentIntentInput = {
  amount: number;
  paymentMethodType: string;
  paymentMethod: string;
  orderUuid: string; //_id
  orderId: number;
  customer?: string;
  description?: string;
  scheduledDate?: string;
  isCateringOrder?: boolean;
  isRideService?: boolean;
};

export type ConfirmPaymentIntentInput = {
  receiptEmail?: string;
};

@Injectable()
export class StripeService {
  logger = new Logger();
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;
  @Inject(OrderService)
  private readonly orderService: OrderService;
  @Inject(ClicksendService)
  private readonly clicksendService: ClicksendService;
  @Inject(ReferralService)
  private readonly referralService: ReferralService;

  private readonly stripeObj: Stripe = StripeSingleton.getInstance();

  async createPaymentIntent(paymentIntentInput: PaymentIntentInput) {
    const params: Stripe.PaymentIntentCreateParams = {
      amount: paymentIntentInput.amount,
      currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
      // Each payment method type has support for different currencies. In order to
      // support many payment method types and several currencies, this server
      // endpoint accepts both the payment method type and the currency as
      // parameters. To get compatible payment method types, pass
      // `automatic_payment_methods[enabled]=true` and enable types in your dashboard
      // at https://dashboard.stripe.com/settings/payment_methods.
      //
      // Some example payment method types include `card`, `ideal`, and `link`.
      payment_method_types: [paymentIntentInput.paymentMethodType],
      metadata: {
        orderId: paymentIntentInput.orderId,
        orderUuid: paymentIntentInput.orderUuid,
        orderLink: getAdminOrderUrl(paymentIntentInput.orderId),
        isCateringOrder: paymentIntentInput.isCateringOrder.toString(),
        isRideService: paymentIntentInput?.isRideService?.toString(),
      },
      ...(paymentIntentInput.paymentMethod
        ? { payment_method: paymentIntentInput.paymentMethod }
        : null),
      customer: paymentIntentInput.customer,
      description: paymentIntentInput.description,
    };
    //TODO: we need to define what payment types are we accepting
    try {
      const paymentIntent: Stripe.PaymentIntent =
        await this.stripeObj.paymentIntents.create(params);
      this.logger.debug(`Created payment intent success: ${paymentIntent}`);

      return paymentIntent;
    } catch (err) {
      this.logger.error(`StripeService@createPaymentIntent: ${err}`);
      throw new HttpException(
        `Failed to create payment intent`,
        HttpStatus.MISDIRECTED
      );
    }
  }
  async searchInvoicesByOrderId(orderId: string) {
    try {
      const queryParams = `metadata['orderId']:"${orderId}"`;
      const invoices = await this.stripeObj.invoices.search({
        query: queryParams,
      });
      if (invoices.data.length === 0) {
        console.log(`No invoices found for order ID: ${orderId}`);
        return;
      }
      return invoices.data[0];
    } catch (error) {
      console.error("Error searching invoices:", error.message);
      throw new Error("Failed to search invoices. Please try again later.");
    }
  }

  async confirmPaymentIntent(
    id: string,
    confirmIntentInput: ConfirmPaymentIntentInput
  ) {
    try {
      const paymentIntent: Stripe.PaymentIntent =
        await this.stripeObj.paymentIntents.confirm(id, {
          ...(confirmIntentInput.receiptEmail ? { receipt_email: "" } : null),
        });
      this.logger.debug(`Confirm payment intent success`);
      this.logger.debug({ paymentIntent });
      return true;
    } catch (err) {
      this.logger.error(`StripeService@confirmPaymentIntent: ${err}`);
      throw new HttpException(
        `Failed to confirm payment intent`,
        HttpStatus.MISDIRECTED
      );
    }
  }

  async refund(refundInput: Stripe.RefundCreateParams) {
    try {
      return await this.stripeObj.refunds.create(refundInput);
    } catch (err) {
      this.logger.error(`StripeService@refund: ${err}`);
      throw new HttpException(
        `Failed to refund`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createCustomer(customerInput: Stripe.CustomerCreateParams) {
    try {
      return await this.stripeObj.customers.create(customerInput);
    } catch (err) {
      this.logger.error(`StripeService@createCustomer: ${err}`);
      throw new HttpException(
        `Failed to create customer`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchCustomer(email: string) {
    try {
      const customer = await this.stripeObj.customers.search({
        query: `email:"${email}"`,
      });
      return customer.data[0] ?? null;
    } catch (err) {
      this.logger.error(`StripeService@createCustomer: ${err}`);
      throw new HttpException(
        `Failed to search customer`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createAndScheduleInvoice(input: {
    amount: number;
    balance: number;
    paid: number;
    scheduledDate: string;
    customer: string;
    orderId: number;
    orderUuid: string;
  }): Promise<Stripe.Invoice> {
    const dueDate = subDays(new Date(input.scheduledDate), 1);

    try {
      // Create invoice
      const invoice = await this.stripeObj.invoices.create({
        customer: input.customer,
        auto_advance: false,
        collection_method: "send_invoice",
        due_date: Math.floor(dueDate.getTime() / 1000),
        currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
        metadata: {
          orderId: input.orderId,
          orderUuid: input.orderUuid,
          orderLink: getAdminOrderUrl(input.orderId),
          paid: input.paid,
        },
      });

      // Add invoice items
      await this.stripeObj.invoiceItems.create({
        customer: input.customer,
        invoice: invoice.id,
        amount: input.amount,
        currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
        description: "Order amount",
        metadata: {
          orderId: input.orderId,
          orderUuid: input.orderUuid,
          orderLink: getAdminOrderUrl(input.orderId),
          paid: input.paid,
        },
      });

      await this.stripeObj.invoiceItems.create({
        customer: input.customer,
        invoice: invoice.id,
        amount: -input.paid,
        currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
        description: "Advance paid",
        metadata: {
          orderId: input.orderId,
          orderUuid: input.orderUuid,
          orderLink: getAdminOrderUrl(input.orderId),
          paid: input.paid,
        },
      });

      // await this.stripeObj.invoiceItems.create({
      //   customer: input.customer,
      //   amount: input.balance,
      //   currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
      //   invoice: invoice.id,
      //   description: "Remaining Balance (50%)",
      // });

      // Finalize the invoice
      const finalizedInvoice = await this.stripeObj.invoices.finalizeInvoice(
        invoice.id,
        null
      );

      // Send the invoice
      await this.stripeObj.invoices.sendInvoice(finalizedInvoice.id);

      this.logger.debug(
        `Created and scheduled invoice: ${JSON.stringify(finalizedInvoice)}`
      );

      return finalizedInvoice;
    } catch (error) {
      this.logger.error(`Error in createAndScheduleInvoice: ${error.message}`);
      throw new HttpException(
        "Failed to create and schedule invoice",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createAndScheduleRideInvoice(input: {
    amount: number;
    balance: number;
    paid: number;
    scheduledDate: string;
    customer: string;
    orderId: number;
    orderUuid: string;
  }): Promise<Stripe.Invoice> {
    const dueDate = subMinutes(new Date(input.scheduledDate), 30);

    try {
      const invoice = await this.stripeObj.invoices.create({
        customer: input.customer,
        auto_advance: false,
        collection_method: "send_invoice",
        due_date: Math.floor(dueDate.getTime() / 1000),
        currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
        metadata: {
          orderId: input.orderId,
          orderUuid: input.orderUuid,
          orderLink: getAdminOrderUrl(input.orderId),
          paid: input.paid,
          isRideService: "true",
        },
      });

      // Add invoice items
      await this.stripeObj.invoiceItems.create({
        customer: input.customer,
        invoice: invoice.id,
        amount: input.amount,
        currency: STRIPE_DEFAULT_SYSTEM_CURRENCY,
        description: "Order amount",
      });

      // Finalize the invoice
      const finalizedInvoice = await this.stripeObj.invoices.finalizeInvoice(
        invoice.id
      );

      // Send the invoice
      await this.stripeObj.invoices.sendInvoice(finalizedInvoice.id);

      await this.triggerInvoiceMessage(finalizedInvoice);

      this.logger.debug(
        `Created and scheduled invoice: ${JSON.stringify(finalizedInvoice)}`
      );

      return finalizedInvoice;
    } catch (error) {
      this.logger.error(`Error in createAndScheduleInvoice: ${error.message}`);
      throw new HttpException(
        "Failed to create and schedule invoice",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async triggerInvoiceMessage(invoice: Stripe.Invoice) {
    const message = `Thank you for reserving your ride with Alfred. Please complete your payment of $${toDollars(
      invoice.amount_due
    )} using the link below to confirm your reservation: ${
      invoice.hosted_invoice_url
    } .
    Please note, if payment is not received 1 hour before your ride, it will be canceled. Thank you for choosing our service!`

    await this.clicksendService.sendSMS({
      to: invoice.customer_phone,
      message: message,
    });

    await this.clicksendService.sendEmail({
      recipient_email: invoice.customer_email,
      recipient_name: invoice.customer_name,
      subject: `Payment Request - Upcoming Ride Booking on ${invoice.due_date}`,
      body: message,
    });
  }

  async handlePayLaterRidePaymentSuccess(metadata: Stripe.Metadata) {
    console.log(`Payment has been completed for order ${metadata.orderId}`);
    const order = await this.orderService.findOne({
      where: { id: Number(metadata.orderId) },
    });
    if (order.referralId) {
      const ambassadorDetails = await this.referralService.findById(
        order.referralId
      );
      console.log(
        `Ambassador details are : ${JSON.stringify(ambassadorDetails)}`
      );
      await this.referralService.postAmbassadorReferralRecord({
        revenue: order.grandTotal,
        transaction_uid: order.nonce,
        first_name: order.clientName,
        email: order.clientEmail,
        campaign_uid: ambassadorDetails.campaign_id,
        short_code: ambassadorDetails.short_code,
        is_approved: true,
      });
    }
    if (order.orderType === OrderType.PAY_LATER) {
      try {
        const redisOrder = await this.cacheManager.get(
          getPayLaterOrderKey(order.id)
        );
        console.log(`key to delete: ${getPayLaterOrderKey(order.id)}`);
        await this.cacheManager.del(getPayLaterOrderKey(order.id));
        await this.cacheManager.set(
          getScheduledRidesOrderKey(order.id),
          redisOrder
        );
        this.orderService.update(
          {
            id: +metadata.orderId,
          },
          {
            paymentStatus: "succeeded",
          }
        );
      } catch (err) {
        console.log(`pendingOrder@cachemanager.del ${err.message}`);
      }
    }
  }

  async getInvoice(invoiceId: string) {
    if (invoiceId) {
      const invoice = this.stripeObj.invoices.retrieve(invoiceId);
      return invoice;
    } else {
      return null;
    }
  }
}
