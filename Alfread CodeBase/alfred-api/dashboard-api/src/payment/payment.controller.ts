import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Req,
  RawBodyRequest,
  UseGuards,
} from "@nestjs/common";
import { RestApiResponse, toCents, GeneralErrorResponse } from "helpers";
import { ApiTags } from "@nestjs/swagger";
import { StripeService, StripeSingleton } from "./stripe.service";
import { APIInitPaymentInputDTO } from "./dto/payment.dto";
import { InitPaymentVM } from "./vm/payment.vm";
import Stripe from "stripe";
import { PaymentLogService } from "./payment-log.service";
import {
  PAYMENT_INTENT_SUCCEEDED,
  STRIPE_PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED,
  STRIPE_PAYMENT_INTENT_CANCELED,
  STRIPE_PAYMENT_INTENT_CREATED,
  STRIPE_PAYMENT_INTENT_FAILED,
  STRIPE_PAYMENT_INTENT_PARTIALLY_FUNDED,
  STRIPE_PAYMENT_INTENT_PROCESSING,
  STRIPE_PAYMENT_INTENT_REQUIRES_ACTION,
  STRIPE_PAYMENT_INTENT_SUCCEEDED,
  STRIPE_REFUND_CREATED,
  STRIPE_REFUND_UPDATED,
} from "../../constants";
import { OrderService } from "src/order/order.service";
import { PaymentProvider } from "database/entities/payment_log.entity";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { AuthGuard } from "src/auth/auth.guard";
import { APIRefundOrderDTO } from "src/order/dto/order.dto";
import { UserType } from "database/enums/usertype";
import { AuthUser } from "src/auth/user.decorator";
import { InjectableUser } from "database/entities/user.entity";
import { OrderStatusEnum, OrderType } from "database/entities/order.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CARMEL_TRIP_CANCEL_EVENT,
  ORDER_STATUS_UPDATED_EVENT,
  SEND_CUSTOMER_ORDER_EMAIL,
} from "../../events";
import Decimal from "decimal.js-light";

@ApiTags("Payment")
@Controller("payment")
// @ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentLogService: PaymentLogService,
    private readonly orderService: OrderService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post("init")
  // @UseGuards(ApiKeyGuard)
  async init(@Body() dto: APIInitPaymentInputDTO) {
    try {
      console.log(`Initiating payment for order ${JSON.stringify(dto)}`);
      const order = await this.orderService.findOne({
        where: { nonce: dto.orderId },
      });
      if (!order) {
        console.log(`Order not found`);
        return GeneralErrorResponse("Order not found", 404);
      }
      const amount = dto.isRideService ? dto.amount : toCents(order.grandTotal);

      let customer = await this.stripeService.searchCustomer(dto.clientEmail);
      if (!customer) {
        customer = await this.stripeService.createCustomer({
          email: dto.clientEmail,
          name: dto.clientName,
          phone: dto.clientNumber,
        });
      }
      if (amount > 50) {
        console.log(`order-log: `, order);
        console.log(
          `Create-payment-intent-input: `,
          JSON.stringify({
            amount: parseFloat(amount.toFixed(2)),
            orderUuid: dto.orderId,
            paymentMethod: dto.paymentMethod,
            paymentMethodType: dto.paymentMethodType,
            orderId: order.id,
            customer: customer.id,
            isCateringOrder: dto.isCateringOrder,
            isRideService: dto.isRideService,
          })
        );
        const paymentIntent = await this.stripeService.createPaymentIntent({
          amount: parseFloat(amount.toFixed(2)),
          orderUuid: dto.orderId,
          paymentMethod: dto.paymentMethod,
          paymentMethodType: dto.paymentMethodType,
          orderId: order.id,
          customer: customer.id,
          description: `Payment for order ${dto.orderId}`,
          isRideService: dto.isRideService,
          isCateringOrder: dto.isCateringOrder,
        });
        await this.handleOrderPaymentStatus(
          paymentIntent,
          STRIPE_PAYMENT_INTENT_CREATED
        );
        return RestApiResponse(new InitPaymentVM(paymentIntent).build());
      } else {
        console.log(`Order is free with amount $${amount} cents`, order.id);
        // We are updating payment status of orders table for PAY_LATER RIDES here as requires_action
        await this.handleZeroOrderPaymentStatus(
          order.id,
          order.grandTotal > 0 ? "requires_action" : "succeeded"
        );
        if (dto.isRideService) {
          this.createInvoice(customer.id, {
            isRideService: dto.isRideService ? "true" : "false",
            orderId: order.id,
          } as Stripe.Metadata);
        }
        return RestApiResponse({
          success: true,
          message: `Order ${dto.orderId} is free with amount $${amount} cents`,
          orderId: dto.orderId,
        });
      }
    } catch (error) {
      console.log(`Error@paymentInit`, error);
      return GeneralErrorResponse("An error occurred", 500);
    }
  }

  //test dev intention only
  @Post("confirm/:id")
  @UseGuards(ApiKeyGuard)
  async confirm(@Param("id") id: string) {
    const data = await this.stripeService.confirmPaymentIntent(id, {
      receiptEmail: null,
    });
    return RestApiResponse(data);
  }

  @Post("refund/:id")
  @UseGuards(AuthGuard)
  async refund(
    @Param("id") id: string,
    @Body() dto: APIRefundOrderDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.findOne({
      where: {
        id: +id,
        orderType: OrderType.CREDIT_CARD,
      },
    });

    if (
      order.status == OrderStatusEnum.CANCELED ||
      order.status == OrderStatusEnum.DELIVERED
    ) {
      const paymentLog = await this.paymentLogService.findOne({
        where: {
          orderId: order.id,
          eventType: STRIPE_PAYMENT_INTENT_SUCCEEDED,
        },
      });
      const stripeRefund = await this.stripeService.refund({
        amount: toCents(parseFloat(dto.amount)),
        reason: dto.reason,
        payment_intent: paymentLog.paymentIntentId,
        metadata: {
          orderId: order.id,
          paymentIntentId: paymentLog.paymentIntentId,
          note: dto.note,
        },
      });
      // stripe returns the value in cents, we convert it to dollars
      await this.orderService.update(
        {
          id: +id,
        },
        {
          refundAmount: new Decimal(stripeRefund.amount)
            .div(new Decimal(100))
            .toNumber(),
        }
      );
      return RestApiResponse(stripeRefund);
    }
    return RestApiResponse({
      message: `Refunds are available for order on ${OrderStatusEnum.CANCELED} or ${OrderStatusEnum.DELIVERED} orders`,
    });
    //on webhooks we will insert into payment logs
  }

  private async handleZeroOrderPaymentStatus(
    orderId: number,
    paymentStatus: string
  ) {
    console.log(`@handleZeroOrderPaymentStatus: ${orderId}`);
    await this.paymentLogService.create({
      paymentIntentId: `ZERO_ORDER_PAYMENT-${orderId}`,
      orderId: +orderId,
      eventType: PAYMENT_INTENT_SUCCEEDED,
      status: paymentStatus,
      paymentProvider: PaymentProvider.NONE,
    });
    await this.updateOrderStatusAndNotify(+orderId, paymentStatus);
  }

  private async updateOrderStatusAndNotify(
    orderId: number,
    paymentStatus: string
  ) {
    console.log(`Processing zero charge order for ${orderId}`);

    const order = await this.orderService.findOne({
      where: {
        id: +orderId,
      },
    });
    const updatedOrder = await this.orderService.update(
      {
        id: +orderId,
      },
      {
        paymentStatus: paymentStatus,
        ...(order.scheduledDate
          ? { status: OrderStatusEnum.SCHEDULED }
          : { status: OrderStatusEnum.PENDING }),
      }
    );
    this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
      id: +orderId,
      nonce: updatedOrder.nonce,
      ...(updatedOrder.scheduledDate
        ? { status: OrderStatusEnum.SCHEDULED }
        : { status: OrderStatusEnum.PENDING }),
      version: updatedOrder.version,
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
    this.eventEmitter.emit(SEND_CUSTOMER_ORDER_EMAIL);
  }

  private async handleOrderPaymentStatus(
    paymentIntent: Stripe.PaymentIntent,
    eventType: string
  ) {
    console.log(eventType, paymentIntent);
    await this.paymentLogService.create({
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata.orderId,
      eventType,
      status: paymentIntent.status,
      paymentProvider: PaymentProvider.STRIPE,
    });
    const order = await this.orderService.findOne({
      where: {
        id: +paymentIntent.metadata.orderId,
      },
    });

    const updatedOrder = await this.orderService.update(
      {
        id: +paymentIntent.metadata.orderId,
      },
      {
        paymentStatus: paymentIntent.status,
        ...(eventType == STRIPE_PAYMENT_INTENT_SUCCEEDED && order.scheduledDate
          ? { status: OrderStatusEnum.SCHEDULED }
          : null),
        ...(eventType == STRIPE_PAYMENT_INTENT_SUCCEEDED && !order.scheduledDate
          ? { status: OrderStatusEnum.PENDING }
          : null),
      }
    );

    if (eventType == STRIPE_PAYMENT_INTENT_SUCCEEDED) {
      this.eventEmitter.emit(SEND_CUSTOMER_ORDER_EMAIL, {
        id: paymentIntent?.metadata?.orderId,
      });

      this.eventEmitter.emit(ORDER_STATUS_UPDATED_EVENT, {
        id: +paymentIntent.metadata.orderId,
        nonce: updatedOrder.nonce,
        status: updatedOrder.scheduledDate
          ? OrderStatusEnum.SCHEDULED
          : OrderStatusEnum.PENDING,
        version: updatedOrder.version,
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
  }

  private async handleOrderRefundStatus(
    refund: Stripe.Refund,
    eventType: string
  ) {
    console.log(eventType, refund);
    await this.paymentLogService.create({
      paymentIntentId: refund.metadata.paymentIntentId,
      orderId: refund.metadata.orderId,
      eventType,
      status: refund.status,
      paymentProvider: PaymentProvider.STRIPE,
    });
    await this.orderService.update(
      {
        id: +refund.metadata.orderId,
      },
      {
        paymentStatus: refund.status,
      }
    );
  }

  private async handlePayLaterInvoiceCreation(
    paymentIntent: Stripe.PaymentIntent,
    eventType: string
  ) {
    await this.paymentLogService.create({
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata.orderId,
      eventType,
      status: paymentIntent.status,
      paymentProvider: PaymentProvider.STRIPE,
    });
  }

  private async handleCancelOrderOnPaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
    eventType: string
  ) {
    console.log(eventType, paymentIntent);
    await this.paymentLogService.create({
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata.orderId,
      eventType,
      status: paymentIntent.status,
      paymentProvider: PaymentProvider.STRIPE,
    });

    const orderEntity = await this.orderService.findOne({
      where: {
        id: +paymentIntent.metadata.orderId,
      },
    });

    if (orderEntity?.orderType != OrderType.PAY_LATER) {
      await this.orderService.cancelOrderById(
        orderEntity,
        STRIPE_PAYMENT_INTENT_FAILED,
        STRIPE_PAYMENT_INTENT_FAILED
      );
    }
  }

  @Post("webhook")
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    let headers = req.headers;
    let body = req.rawBody;
    let event: Stripe.Event = null;
    const stripe = StripeSingleton.getInstance();
    try {
      event = stripe.webhooks.constructEvent(
        body,
        headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    if (!Object.keys(paymentIntent.metadata).length) {
      const invoice = await this.stripeService.getInvoice(
        paymentIntent.invoice as string
      );
      if (invoice) {
        paymentIntent.metadata = invoice.metadata;
      }
    }
    console.log(`Meta Data : ${JSON.stringify(paymentIntent.metadata)}`);
    switch (event.type) {
      case STRIPE_PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED
        );
        break;
      case STRIPE_PAYMENT_INTENT_CANCELED:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_CANCELED
        );
        break;
      case STRIPE_PAYMENT_INTENT_CREATED:
        if (
          paymentIntent.metadata.isRideService &&
          paymentIntent.metadata.isRideService.toLowerCase() === "true"
        ) {
          await this.handlePayLaterInvoiceCreation(
            event.data.object as Stripe.PaymentIntent,
            STRIPE_PAYMENT_INTENT_CREATED
          );
        }
        // we omit handleOrderPaymentStatus because the status is different from the one when we create the intent response
        // so we handle the order payment status and order update there -> -_-
        // await this.handleOrderPaymentStatus(event.data.object as Stripe.PaymentIntent, STRIPE_PAYMENT_INTENT_CREATED);
        break;
      case STRIPE_PAYMENT_INTENT_PARTIALLY_FUNDED:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_PARTIALLY_FUNDED
        );
        break;
      case STRIPE_PAYMENT_INTENT_FAILED:
        await this.handleCancelOrderOnPaymentFailed(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_FAILED
        );
        break;
      case STRIPE_PAYMENT_INTENT_PROCESSING:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_PROCESSING
        );
        break;
      case STRIPE_PAYMENT_INTENT_REQUIRES_ACTION:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_REQUIRES_ACTION
        );
        break;
      case STRIPE_PAYMENT_INTENT_SUCCEEDED:
        await this.handleOrderPaymentStatus(
          event.data.object as Stripe.PaymentIntent,
          STRIPE_PAYMENT_INTENT_SUCCEEDED
        );
        if (
          paymentIntent.metadata.isCateringOrder &&
          paymentIntent.metadata.isCateringOrder.toLowerCase() === "true"
        ) {
          console.log(
            "Catering order payment succeeded, creating invoice for the remaining amount"
          );
          this.createInvoice(
            paymentIntent.customer as string,
            paymentIntent.metadata
          );
        }
        if (
          paymentIntent.metadata.isRideService &&
          paymentIntent.metadata.isRideService.toLowerCase() === "true"
        ) {
          console.log("Ride service payment succeeded");
          await this.stripeService.handlePayLaterRidePaymentSuccess(
            paymentIntent.metadata
          );
        }
        break;
      case STRIPE_REFUND_CREATED:
        await this.handleOrderRefundStatus(
          event.data.object as Stripe.Refund,
          STRIPE_REFUND_CREATED
        );
        break;
      case STRIPE_REFUND_UPDATED:
        await this.handleOrderRefundStatus(
          event.data.object as Stripe.Refund,
          STRIPE_REFUND_UPDATED
        );
        break;

      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async createInvoice(customer: string, metadata: Stripe.Metadata) {
    const order = await this.orderService.findOne({
      where: { id: Number(metadata.orderId) },
    });
    if (metadata.isRideService.toLowerCase() === "true") {
      const invoice = await this.stripeService.createAndScheduleRideInvoice({
        balance: parseFloat(toCents(order.grandTotal).toFixed(2)),
        amount: toCents(order.grandTotal),
        paid: toCents(0),
        orderUuid: order.nonce,
        orderId: order.id,
        customer: customer,
        scheduledDate: order.scheduledDate,
      });
      console.log(`Invoice created`, invoice);
    } else {
      const invoice = await this.stripeService.createAndScheduleInvoice({
        balance: parseFloat(toCents(order.grandTotal).toFixed(2)),
        amount: toCents(order.grandTotal),
        paid: 0,
        orderUuid: metadata.orderId,
        orderId: order.id,
        customer: customer,
        scheduledDate: order.scheduledDate,
      });
      console.log(`Invoice created`, invoice);
    }
  }
}
