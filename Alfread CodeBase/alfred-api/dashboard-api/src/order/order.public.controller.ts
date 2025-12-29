import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { RestApiResponse } from "helpers";
import { DetailedOrderVM } from "./vm/order.vm";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { HotelService } from "src/hotel/hotel.service";
import { VoucherProgramType } from "database/entities/voucher_program.entity";
import { TransactionManagerService } from "src/transaction-manager/transaction-manager.service";
import { CancelOrderByIdDTO } from "./dto/cancel-order-by-id.dto";

@ApiTags("Order (API Key Public)")
@Controller("gateway/order/public")
@ApiBearerAuth()
export class PublicOrderController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly orderService: OrderService,
    private readonly transactionManagerService: TransactionManagerService
  ) {}

  @Get(":nonce")
  @UseGuards(ApiKeyGuard)
  async findByNonce(@Param("nonce") nonce: string) {
    const order = await this.orderService.findOne({
      where: {
        nonce,
      },
    });
    const details = await this.orderService.getOrderDetails(order.id);
    const detailedOrderVM = new DetailedOrderVM({
      ...details,
      id: details._id,
    }).build();
    delete detailedOrderVM.paymentIntentId;
    delete detailedOrderVM.stripeUrl;
    if (detailedOrderVM.clientNumber) {
      const numberLength = detailedOrderVM.clientNumber.length - 2 - 4;
      const obfuscatedNumber = new Array(numberLength + 1).join("*");
      detailedOrderVM.clientNumber = `${detailedOrderVM.clientNumber.substring(
        0,
        2
      )}${obfuscatedNumber}${detailedOrderVM.clientNumber.substring(
        detailedOrderVM.clientNumber.length - 4
      )}`;
    }
    detailedOrderVM.clientMail = detailedOrderVM.clientEmail;
    if (detailedOrderVM.clientEmail) {
      const email = detailedOrderVM.clientEmail.split("@");
      const length = email[0].length;
      const obfuscatedString = new Array(length + 1).join("*");
      const obfuscatedEmail = `${email[0].substring(0, 2)}${obfuscatedString}@${
        email[1]
      }`;
      detailedOrderVM.clientEmail = obfuscatedEmail;
    }

    return RestApiResponse(detailedOrderVM);
  }

  @Post("create-order/:nonce")
  @UseGuards(ApiKeyGuard)
  async createOrderByNonce(
    @Body() createOrderDTO: CreateOrderDTO,
    @Param("nonce") nonce: string
  ) {
    try {
      console.log("createOrderDTO: ", JSON.stringify(createOrderDTO));
      const order = await this.orderService.create(createOrderDTO, nonce);
      console.log(`Order created successfully`);
      console.log(`Order: ${JSON.stringify(order)}`);
      return order;
    } catch (err) {
      console.log(`error:publicOrderService.create ${err}`);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("create-order")
  @UseGuards(ApiKeyGuard)
  async createOrder(@Body() createOrderDTO: CreateOrderDTO) {
    try {
      const nonce = `${Math.random().toString(36).slice(7).toUpperCase()}`;
      console.log("createOrderDTO: ", JSON.stringify(createOrderDTO));
      const order = await this.orderService.create(createOrderDTO, nonce);
      console.log(`Order created successfully`);
      console.log(`Order: ${JSON.stringify(order)}`);
      return order;
    } catch (err) {
      console.log(`error:publicOrderService.create ${err}`);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Put("refund-voucher/:order_id")
  @UseGuards(ApiKeyGuard)
  async refundVoucher(@Param("order_id") orderId: number) {
    try {
      console.log("publicOrderService.refundOrder: ", orderId);
      await this.transactionManagerService.executeInTransaction(
        async (queryRunner) => {
          const order = await this.orderService.getOrderDetails(
            orderId,
            null,
            null,
            false
          );
          console.log(`Order details fetched successfully`);
          if (!order) {
            throw new HttpException("Order not found", HttpStatus.NOT_FOUND);
          }
          console.log(`Order: ${JSON.stringify(order)}`);
          if (order.type === VoucherProgramType.PER_DIEM) {
            await this.orderService.processOrderRefund(
              orderId,
              order.refund_amount,
              order.applied_voucher_amount,
              order.applied_voucher_amount,
              order.voucher_code_id,
              queryRunner
            );
          }
        }
      );
      console.log(`publicOrderService.refundOrder completed successfully`);
      return RestApiResponse({
        message: `Refund completed successfully for order : ${orderId}`,
      });
    } catch (err) {
      console.log(`error:publicOrderService.refundOrder ${err}`);
      return RestApiResponse({
        message: `Refund failed for order : ${orderId}`,
      });
    }
  }

  @Post("cancel-order/:order_id")
  @UseGuards(ApiKeyGuard)
  async cancelOrder(
    @Body() cancelOrderDTO: CancelOrderByIdDTO,
    @Param("order_id") orderId: string
  ) {
    try {
      console.log("Cancel Order for Id: ", orderId);
      const orderDetails = await this.orderService.findOne({
        where: {
          id: +orderId,
        },
      });
      if (orderDetails) {
        const order = await this.orderService.cancelOrderById(
          orderDetails,
          cancelOrderDTO.reason,
          cancelOrderDTO.option
        );
        return order;
      } else {
        console.log(`Cancel Order Not found for order Id : ${orderId}`);
      }
    } catch (err) {
      console.log(`error:publicOrderService.create ${err}`);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

const convertTZ = (date, tzString) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};
