import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import { UserType } from "../../database/enums/usertype";
import { OrderService } from "./order.service";
import { RestApiResponse } from "helpers";
import { DetailedOrderVM, OrderDetailsVM } from "./vm/order.vm";
import { MealPeriodService } from "../meal_period/meal_period.service";
import { CancelOrderDTO } from "./dto/cancel-order.dto";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { UpdateOrderStatusDTO } from "./dto/update-order-status.dto";
import { OrderListQueryParams } from "./dto/order.dto";
import type { Response } from "express";
import { ExporterService } from "../exporter/exporter.service";
import { TransactionManagerService } from "src/transaction-manager/transaction-manager.service";
import { VoucherProgramType } from "database/entities/voucher_program.entity";

@ApiTags("Order (Tenant)")
@Controller("tenant/order")
@ApiBearerAuth()
export class TenantOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly mealPeriodService: MealPeriodService,
    private readonly exporterService: ExporterService,
    private readonly transactionManagerService: TransactionManagerService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: "date", required: false, type: String })
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findAll(
      query.page,
      query
    );
    return RestApiResponse(new DetailedOrderVM(data).build(), {
      page: query.page,
      total,
      limit: take,
    });
  }

  @Get("details")
  @UseGuards(AuthGuard)
  @ApiQuery({ name: "date", required: false, type: String })
  async findAllWithDetails(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findAllWithPagination(
      query.page,
      query
    );
    return RestApiResponse(new DetailedOrderVM(data).build(), {
      page: query.page,
      total,
      limit: take,
    });
  }

  @Get("reports/export")
  @UseGuards(AuthGuard)
  @ApiQuery({ name: "date", required: false, type: String })
  @Header("Content-Type", "application/xls")
  async export(
    @Res({ passthrough: true }) response: Response,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data } = await this.orderService.findAll(null, query, true);
    const detailedOrderVMs = new DetailedOrderVM(data).build();

    const buffer = await this.exporterService.getOrderExcelReport(
      detailedOrderVMs
    );
    response.set({
      "Content-Type": "application/xls",
      "Content-Disposition": `attachment; filename="${Date.now()}-Order-Report.xlsx"`,
    });

    //@ts-ignore
    return new StreamableFile(buffer);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.getOrderDetails(+id);
    return RestApiResponse(
      new DetailedOrderVM({
        ...order,
      }).build()
    );
  }

  //hotel routes

  @Get("hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelFindAll(
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findByHotel(
      +hotelId,
      query.page,
      query
    );
    const promises = [];
    data.forEach((order) => {
      promises.push(this.orderService.getOrderDetails(order.id));
    });
    const ordersWithDetails = await Promise.all(promises);
    return RestApiResponse(new DetailedOrderVM(ordersWithDetails).build(), {
      page: query.page,
      total,
      limit: take,
    });
  }

  @Get("list/today/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelListToday(
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.orderService.listTodayOrders(+hotelId);
    const promises = [];
    data.forEach((order) => {
      promises.push(this.orderService.getOrderDetails(order.id));
    });
    const ordersWithDetails = await Promise.all(promises);
    return RestApiResponse(new DetailedOrderVM(ordersWithDetails).build());
  }

  @Get(":id/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelFindOne(
    @Param("hotel_id") hotelId: string,
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.getOrderDetails(+id);
    const mealPeriod = await this.mealPeriodService.findOne({
      where: {
        id: order.mealPeriodId,
      },
    });
    return RestApiResponse(
      new DetailedOrderVM({
        ...order,
        mealPeriodName: mealPeriod.name,
      }).build()
    );
  }

  @Post(":id/pending/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelPendingOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.pendingOrder(
      +id,
      +hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/confirm/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelConfirmOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.confirmOrder(
      +id,
      +hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/preparation/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelPrepareOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.prepareOrder(
      +id,
      +hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/in_delivery/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async inDeliveryOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.inDeliveryOrder(
      +id,
      +hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/delivered/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async deliveredOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.deliveredOrder(
      +id,
      +hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/cancel/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async hotelCancelOrder(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() cancelOrderDTO: CancelOrderDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.cancelOrder(
      +id,
      +hotelId,
      null,
      cancelOrderDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post("hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async create(
    @Param("hotel_id") hotelId: string,
    @Body() createOrderDTO: CreateOrderDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.create(createOrderDTO);
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  //merchant routes
  @Get("merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantFindAll(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findByMerchant(
      +merchantId,
      query.page,
      query
    );
    const promises = [];
    data.forEach((order) => {
      promises.push(this.orderService.getOrderDetails(order.id));
    });
    const ordersWithDetails = await Promise.all(promises);
    return RestApiResponse(new DetailedOrderVM(ordersWithDetails).build(), {
      page: query.page,
      total,
      limit: take,
    });
  }

  @Get("list/today/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantListToday(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.orderService.listTodayOrders(null, +merchantId);
    const promises = [];
    data.forEach((order) => {
      promises.push(this.orderService.getOrderDetails(order.id));
    });
    const ordersWithDetails = await Promise.all(promises);
    return RestApiResponse(new DetailedOrderVM(ordersWithDetails).build());
  }

  @Get(":id/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantFindOne(
    @Param("merchant_id") merchantId: string,
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.getOrderDetails(+id);
    const mealPeriod = await this.mealPeriodService.findOne({
      where: {
        id: order.mealPeriodId,
      },
    });
    return RestApiResponse(
      new DetailedOrderVM({
        ...order,
        mealPeriodName: mealPeriod.name,
      }).build()
    );
  }

  @Post(":id/confirm/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantConfirmOrder(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.confirmOrder(
      +id,
      null,
      +merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/preparation/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantPrepareOrder(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.prepareOrder(
      +id,
      null,
      +merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/cancel/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async merchantCancelOrder(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @Body() cancelOrderDTO: CancelOrderDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.cancelOrder(
      +id,
      null,
      +merchantId,
      cancelOrderDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async deleteOrder(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    await this.orderService.deleteOrder(+id);
    return RestApiResponse({});
  }

  @Put("refund-voucher")
  @UseGuards(AuthGuard)
  async refundVoucher(
    @Query("order_id") orderId: number,
    @Query("refund_amount") refundAmount: number
  ) {
    try {
      console.log("tenantOrderController.refundOrder: ", orderId);
      await this.transactionManagerService.executeInTransaction(
        async (queryRunner) => {
          const order = await this.orderService.getOrderDetails(
            Number(orderId),
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
            if (order.applied_voucher_amount < Number(refundAmount)) {
              throw new HttpException(
                "Refund amount cannot be greater than voucher consumed amount",
                HttpStatus.BAD_REQUEST
              );
            }
            await this.orderService.processOrderRefund(
              orderId,
              order.refund_amount,
              order.applied_voucher_amount,
              Number(refundAmount),
              order.voucher_code_id,
              queryRunner
            );
          } else {
            throw new HttpException(
              "Order is not a PER DIEM voucher order",
              HttpStatus.BAD_REQUEST
            );
          }
        }
      );
      console.log(`tenantOrderService.refundOrder completed successfully`);
      return RestApiResponse({
        message: `Refund completed successfully for order : ${orderId}`,
      });
    } catch (err) {
      console.log(`error:tenantOrderService.refundOrder ${err}`);
      return RestApiResponse({
        message: `Refund failed for order : ${orderId}`,
      });
    }
  }
}
