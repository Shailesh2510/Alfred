import {  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
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
import { RestApiResponse, TenantImpersonateQueryParams } from "helpers";
import { DetailedOrderVM, OrderDetailsVM } from "./vm/order.vm";
import { MealPeriodService } from "../meal_period/meal_period.service";
import { CancelOrderDTO } from "./dto/cancel-order.dto";
import { UpdateOrderStatusDTO } from "./dto/update-order-status.dto";
import { OrderListQueryParams } from "./dto/order.dto";
import type { Response } from "express";
import { ExporterService } from "../exporter/exporter.service";

@ApiTags("Order (Merchant)")
@Controller("merchant/order")
@ApiBearerAuth()
export class MerchantOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly mealPeriodService: MealPeriodService,
    private readonly exporterService: ExporterService
  ) {}

  //merchant routes
  @Get()
  @UseGuards(AuthGuard)
  async merchantFindAll(
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findByMerchant(
      +authUser.merchantId,
      query.page,
      query
    );
    const statistics = await this.orderService.getOrderStatistics(
      null,
      +authUser.merchantId,
      query,
      true
    );
    return RestApiResponse(new DetailedOrderVM(data).build(), {
      page: query.page,
      total,
      limit: take,
      statistics,
    });
  }

  @Get("list/today")
  @UseGuards(AuthGuard)
  async merchantListToday(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const data = await this.orderService.listTodayOrdersWithDetails(
      null,
      +authUser.merchantId
    );
    return RestApiResponse(new DetailedOrderVM(data).build());
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async merchantFindOne(
    @Query() _: TenantImpersonateQueryParams,
    @Param("merchant_id") merchantId: string,
    @Param("id") id: string,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.getOrderDetails(
      +id,
      authUser.merchantId
    );
    return RestApiResponse(
      new DetailedOrderVM({
        ...order,
      }).build()
    );
  }

  @Post(":id/pending")
  @UseGuards(AuthGuard)
  async merchantPendingOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.pendingOrder(
      +id,
      null,
      +authUser.merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/confirm")
  @UseGuards(AuthGuard)
  async merchantConfirmOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.confirmOrder(
      +id,
      null,
      +authUser.merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/preparation")
  @UseGuards(AuthGuard)
  async merchantPrepareOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.prepareOrder(
      +id,
      null,
      +authUser.merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/in_delivery")
  @UseGuards(AuthGuard)
  async inDeliveryOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.inDeliveryOrder(
      +id,
      null,
      +authUser.merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/delivered")
  @UseGuards(AuthGuard)
  async deliveredOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.deliveredOrder(
      +id,
      null,
      +authUser.merchantId,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/cancel")
  @UseGuards(AuthGuard)
  async merchantCancelOrder(
    @Query() _: TenantImpersonateQueryParams,
    @Param("id") id: string,
    @Body() cancelOrderDTO: CancelOrderDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.cancelOrder(
      +id,
      null,
      +authUser.merchantId,
      cancelOrderDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Get("reports/export")
  @UseGuards(AuthGuard)
  @ApiQuery({ name: "date", required: false, type: String })
  @Header("Content-Type", "application/xls")
  async export(
    @Res({ passthrough: true }) response: Response,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data } = await this.orderService.findByMerchant(
      +authUser.merchantId,
      null,
      query,
      true
    );
    const detailedOrderVMs = new DetailedOrderVM(data).build();

    const buffer = await this.exporterService.getOrderExcelReport(
      detailedOrderVMs,
      true
    );
    response.set({
      "Content-Type": "application/xls",
      "Content-Disposition": `attachment; filename="${Date.now()}-Order-Report.xlsx"`,
    });

    //@ts-ignore
    return new StreamableFile(buffer);
  }
}
