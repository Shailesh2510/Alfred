import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  StreamableFile,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import { UserType } from "../../database/enums/usertype";
import { OrderService } from "./order.service";
import { RestApiResponse } from "helpers";
import { DetailedOrderVM, OrderDetailsVM, OrderWithCommissionsVM } from "./vm/order.vm";
import { MealPeriodService } from "../meal_period/meal_period.service";
import { CancelOrderDTO } from "./dto/cancel-order.dto";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { UpdateOrderStatusDTO } from "./dto/update-order-status.dto";
import { OrderListQueryParams, OrderCommissionListQueryParams } from "./dto/order.dto";
import type { Response } from "express";
import { ExporterService } from "../exporter/exporter.service";

@ApiTags("Order (Hotel)")
@Controller("hotel/order")
@ApiBearerAuth()
export class HotelOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly mealPeriodService: MealPeriodService,
    private readonly exporterService: ExporterService
  ) {}

  //hotel routes

  @Get()
  @UseGuards(AuthGuard)
  async hotelFindAll(
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data, total, take } = await this.orderService.findByHotel(
      +authUser.hotelId,
      query.page,
      query
    );
    const statistics = await this.orderService.getOrderStatistics(
      +authUser.hotelId,
      null,
      query
    );
    return RestApiResponse(new DetailedOrderVM(data).build(), {
      page: query.page,
      total,
      limit: take,
      statistics,
    });
  }

  @Get("commissions")
  @UseGuards(AuthGuard)
  async hotelOrderComissionsFindAll(
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Query() query: OrderCommissionListQueryParams
  ) {
    const { data, total, take } = await this.orderService.getOrdersWithCommissions(
      +authUser.hotelId,
      query.page,
      query
    );

    return RestApiResponse(new OrderWithCommissionsVM(data).build(), {
      page: query.page,
      total,
      limit: take,
    });
  }

  @Get("list/today")
  @UseGuards(AuthGuard)
  async hotelListToday(
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const data = await this.orderService.listTodayOrders(+authUser.hotelId);
    return RestApiResponse(new DetailedOrderVM(data).build());
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async hotelFindOne(
    @Param("id") id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.getOrderDetails(
      +id,
      null,
      authUser.hotelId
    );
    return RestApiResponse(
      new DetailedOrderVM({
        ...order,
      }).build()
    );
  }

  @Post(":id/confirm")
  @UseGuards(AuthGuard)
  async hotelConfirmOrder(
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.confirmOrder(
      +id,
      +authUser.hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/preparation")
  @UseGuards(AuthGuard)
  async hotelPrepareOrder(
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.prepareOrder(
      +id,
      +authUser.hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/in_delivery")
  @UseGuards(AuthGuard)
  async inDeliveryOrder(
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.inDeliveryOrder(
      +id,
      +authUser.hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/delivered")
  @UseGuards(AuthGuard)
  async deliveredOrder(
    @Param("id") id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.deliveredOrder(
      +id,
      +authUser.hotelId,
      null,
      updateOrderStatusDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post(":id/cancel")
  @UseGuards(AuthGuard)
  async hotelCancelOrder(
    @Param("id") id: string,
    @Body() cancelOrderDTO: CancelOrderDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.cancelOrder(
      +id,
      +authUser.hotelId,
      null,
      cancelOrderDTO
    );
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Post("hotel")
  @UseGuards(AuthGuard)
  async create(
    @Body() createOrderDTO: CreateOrderDTO,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const order = await this.orderService.create({
      ...createOrderDTO,
      hotelId: authUser.hotelId,
    });
    return RestApiResponse(new OrderDetailsVM(order).build());
  }

  @Get("reports/export")
  @UseGuards(AuthGuard)
  @ApiQuery({ name: "date", required: false, type: String })
  @Header("Content-Type", "application/xls")
  async export(
    @Res({ passthrough: true }) response: Response,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Query() query: OrderListQueryParams
  ) {
    const { data } = await this.orderService.findByHotel(
      +authUser.hotelId,
      null,
      query,
      true
    );
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
}
