import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { CityService } from "src/city/city.service";
import { HotelService } from "src/hotel/hotel.service";
import { MerchantService } from "src/merchant/merchant.service";
import { findShortestDeliveryDuration } from "src/utils/utils";

@Injectable()
export class ShipdayService implements OnModuleInit {
  private readonly logger = new Logger(ShipdayService.name);
  private axiosClient: AxiosInstance;
  private readonly baseUrl = "https://api.shipday.com";
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(MerchantService)
  private readonly merchantService: MerchantService;
  @Inject(CityService)
  private readonly cityService: CityService;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.SHIPDAY_API_KEY}`,
      },
    });
  }

  async onModuleInit() {
    try {
      this.logger.log("Shipday API client initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Shipday API client:", error);
      throw error;
    }
  }

  async getOrderDetails(orderNumber: string) {
    try {
      const response = await this.axiosClient.get(`/orders/${orderNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get order ${orderNumber}: ${error.message}`);
      throw error;
    }
  }

  async assignDriver(orderId: string, driverId: string) {
    try {
      await this.axiosClient.post(`/orders/${orderId}/assign`, { driverId });
      this.logger.log(`Assigned driver ${driverId} to order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to assign driver: ${error.message}`);
    }
  }

  async cancelOrder(orderId: number) {
    try {
      await this.axiosClient.post(`/on-demand/cancel/${orderId}`);
      this.logger.log(`Cancelled order ${orderId} from 3rd party service`);
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`);    }
  }

  async insertOrder(orderData: any) {
    try {
      const response = await this.axiosClient.post("/orders", orderData);
      this.logger.log(`Created delivery order: ${response.data.orderId}`);
      return { ...response.data, status: "READY_FOR_PICKUP" };
    } catch (error) {
      this.logger.error(`Failed to create and ready order: ${error.message}`);
      throw error;
    }
  }

  async markOrderReadyForPickup(orderNumber: string) {
    try {
      const order = await this.getOrderDetails(orderNumber);
      if (!order) {
        throw new Error(`Order ${orderNumber} not found`);
      }

      await this.axiosClient.put(`/orders/${order[0].orderId}/meta`, {
        readyToPickup: true,
      });
      this.logger.log(`Marked order ${orderNumber} as ready for pickup`);
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to mark order ${orderNumber} as ready for pickup: ${error.message}`
      );
      throw error;
    }
  }

  async deleteOrder(orderNumber: string) {
    try {
      const order = await this.getOrderDetails(orderNumber);
      if (!order) {
        throw new Error(`Order ${orderNumber} not found`);
      }
      if (order[0]?.thirdPartyDeliveryOrder || order[0]?.carrier) {
        await this.cancelOrder(order[0].orderId);
      }
      await this.axiosClient.delete(`/orders/${order[0].orderId}`);
      this.logger.log(`Deleted order ${orderNumber}`);
      return {
        success: true,
        message: `Order ${orderNumber} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete order ${orderNumber}: ${error.message}`
      );
      throw error;
    }
  }

  async checkAvailability(hotelWebCode: string, merchantId: number) {
    try {
      const hotel = await this.hotelService.findOne({
        where: {
          webCode: hotelWebCode,
        },
      });
      const merchant = await this.merchantService.findOne({
        where: {
          id: +merchantId,
        },
      });
      const city = await this.cityService.findOne({
        where: {
          id: merchant.cityId,
        },
      });

      if (!hotel || !merchant) {
        throw new Error(`Hotel or merchant was not found`);
      }

      const producerLocation = `${merchant.addressNumber} ${merchant.addressStreet}, ${city.name}, ${city.state}, USA`;
      const consumerLocation = `${hotel.addressNumber} ${hotel.addressStreet}, ${city.name}, ${city.state}, USA`;

      const requestTimestamp = new Date().toISOString();

      const response = await this.axiosClient.post("/driver/availability", {
        pickupAddress: producerLocation,
        deliveryAddress: consumerLocation,
        requestTimestamp,
      });
      return findShortestDeliveryDuration(response.data);
    } catch (error) {
      this.logger.error(`Failed to check availability: ${error.message}`);
      throw error;
    }
  }

  async assignToOnDemand(carrierName: string, orderNumber: string) {
    try {
      const order = await this.getOrderDetails(orderNumber);

      if (!order) {
        throw new Error(`Order ${orderNumber} not found`);
      }

      const response = await this.axiosClient.post("/on-demand/assign", {
        name: carrierName,
        orderId: order[0].orderId,
      });

      console.log("Successfully assigned to on-demand service:", {
        responseData: JSON.stringify(response.data),
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to assign driver : ${(JSON.stringify(error), error.message)}`
      );
      throw error;
    }
  }
}
