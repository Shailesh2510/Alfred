import { Inject, Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { CityService } from "src/city/city.service";
import { HotelService } from "src/hotel/hotel.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { OrderService } from "src/order/order.service";
import { OrderStatus, OrderStatusEnum } from "database/entities/order.entity";
import { Repository } from "typeorm";
import { ORDER_STATUS_REPOSITORY } from "../../constants";
import { PriceListDto } from "./dto/price-list.dto";

export const airportCoordinates = {
  JFK: { latitude: 40.645039, longitude: -73.779812 },
  EWR: { latitude: 40.690232, longitude: -74.173679 },
  LGA: { latitude: 40.777123, longitude: -73.87336 },
};

@Injectable()
export class CarmelService {
  private readonly apiUrl = "https://api.carmellimo.com/JobsWebServ/v2_01/Impl";
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(CityService)
  private readonly cityService: CityService;
  @Inject(OrderService)
  private readonly orderService: OrderService;
  @Inject(ORDER_STATUS_REPOSITORY)
  private readonly orderStatusRepository: Repository<OrderStatus>;
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  async getPriceList(webCode: string, rideDetails: PriceListDto): Promise<any> {
    const payload = {
      calls: [
        {
          method: "PriceList",
          params: {
            Trip: {
              addrPu: rideDetails.addressFrom,
              addrDo: rideDetails.addressTo,
              roundTrip: false,
              asap: false,
              tripDate: rideDetails.tripDate,
              tripTime: rideDetails.tripTime,
            },
            fareOptions: true,
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    try {
      const response = await this.axiosClient.post("", payload);
      console.log("Successfully fetched price list from Carmel API.");
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        const priceList = response.data.results[0]?.data?.priceList || [];

        const formattedFareList = priceList.map((item: any) => {
          const fareOptions = item.fareOptions?.filter(
            (fare: any) => fare.fareTypeCd === "I"
          );

          if (!fareOptions || fareOptions.length === 0) return null;

          return {
            ...item,
            fare: fareOptions[0],
          };
        });

        return formattedFareList;
      }
    } catch (error) {
      console.error(
        "Error fetching price list from Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch price list from Carmel API.");
    }
  }

  async updateTrip(webCode: string, rideDetails: CreateTripDto): Promise<any> {
    const order = await this.orderService.findOne({
      where: {
        nonce: rideDetails.nonce,
      },
    });

    const fare = {
      fareId: rideDetails.fareId || "",
      taxExampt: false,
      processingFeeOverride: false,
      taxOverride: false,
      fareOverride: false,
      commissionOverride: false,
      fuelOverride: false,
      nysFundOverride: false,
      discountOverride: false,
    };

    const cust = {
      firstName: rideDetails.customerFirstName || "",
      lastName: rideDetails.customerLastName || "",
      phone: {
        number: rideDetails.customerPhone?.number || "",
        countryCode: rideDetails.customerPhone?.countryCode || "",
      },
      emailAddr: rideDetails.emailAddr || "",
    };

    const selectedCar = {
      carClassID: rideDetails.carClassID || "",
    };
    let payload = null;
    if (rideDetails?.nonce) {
      payload = {
        calls: [
          {
            method: "TripUpdate",
            id: rideDetails.nonce,
            params: {
              Trip: {
                addrPu: rideDetails.addressFrom,
                addrDo: rideDetails.addressTo,
                roundTrip: false,
                fare: fare,
                fop: {
                  fopCode: "AV",
                },
                car: selectedCar,
                asap: false,
                cust: cust,
                tripDate: rideDetails.tripDate,
                tripTime: rideDetails.tripTime,
              },
              Credentials: {
                accessToken: process.env.CARMEL_API_KEY,
              },
            },
          },
        ],
      };
    } else {
      console.error(`Carmel API error: Failed to find Order Id`);
      throw new Error(`Carmel API error: Failed to find Order Id`);
    }

    console.log("Carmel Trip Update Payload:", JSON.stringify(payload));

    try {
      const response = await this.axiosClient.post("", payload);
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        console.log(
          `Successfully updated the trip with Carmel API and response is  ${JSON.stringify(
            response.data.results[0]
          )}`
        );
        await this.orderStatusRepository.save({
          orderId: order.id,
          orderVersion: order.version,
          status: OrderStatusEnum.CARMEL_TRIP_CREATED,
          relayResponse: { Trip: response.data.results[0].data },
        });

        // await this.cancelTripByTripId(
        //   rideDetails.nonce,
        //   response.data.results[0].data.tripId
        // );

        await this.orderService.update(order.id, {
          comment: response.data.results[0].data.tripId,
        });

        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error updating trip with Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to update trip with Carmel API.");
    }
  }

  async fetchCarLocationByNonce(nonce: string) {
    const orderDetails = await this.orderService.findOne({
      where: {
        nonce: nonce,
      },
    });

    if (!orderDetails) {
      throw new Error(`Order was not found`);
    }

    const carmelTripId = orderDetails.comment;

    const payload = {
      calls: [
        {
          method: "CarLocationByTrip",
          params: {
            tripId: carmelTripId,
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    try {
      const response = await this.axiosClient.post("", payload);
      console.log("Successfully fetched car location from Carmel API.");
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error fetching car location from Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch car location from Carmel API.");
    }
  }

  async fetchTripInformationByNonce(nonce: string) {
    const orderDetails = await this.orderService.findOne({
      where: {
        nonce: nonce,
      },
    });

    if (!orderDetails) {
      throw new Error(`Order was not found`);
    }

    const carmelTripId = orderDetails.comment;

    const payload = {
      calls: [
        {
          method: "Trip",
          params: {
            tripId: carmelTripId,
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    try {
      const response = await this.axiosClient.post("", payload);
      console.log("Successfully fetched trip information from Carmel API.");
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error fetching trip information from Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch ptrip information from Carmel API.");
    }
  }

  async cancelTrip(orderId: number): Promise<any> {
    console.log(
      `Cancel trip triggered with arguments : ${JSON.stringify({
        orderId: orderId,
      })}`
    );
    const orderStatus = await this.orderStatusRepository.findOne({
      where: {
        orderId: orderId,
        status: OrderStatusEnum.CARMEL_TRIP_CREATED,
      },
    });
    if (!orderStatus) {
      throw new Error(`Order was not found`);
    }
    const payload = {
      calls: [
        {
          method: "TripCancel",
          params: {
            TripCancel: {
              tripId: orderStatus.relayResponse?.Trip?.tripId,
            },
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    console.log("Carmel Trip Cancel Payload:", JSON.stringify(payload));
    try {
      const response = await this.axiosClient.post("", payload);
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        console.log(
          `Successfully cancelled the trip with Carmel API and response is  ${JSON.stringify(
            response.data.results[0]
          )}`
        );
        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error cancelling trip with Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to cancel trip with Carmel API.");
    }
  }

  async getTrip(orderId: number): Promise<any> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: {
        orderId: orderId,
        status: OrderStatusEnum.CARMEL_TRIP_CREATED,
      },
    });
    if (!orderStatus) {
      throw new Error(`Order was not found`);
    }
    const payload = {
      calls: [
        {
          method: "Trip",
          params: {
            tripId: orderStatus.relayResponse?.Trip?.tripId,
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    try {
      const response = await this.axiosClient.post("", payload);
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error retrieving trip from Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to retrieve trip with Carmel API.");
    }
  }

  async cancelTripByTripId(orderNonce: string, tripId: number): Promise<any> {
    const payload = {
      calls: [
        {
          method: "TripCancel",
          id: orderNonce,
          params: {
            TripCancel: {
              tripId: tripId,
            },
            Credentials: {
              accessToken: process.env.CARMEL_API_KEY,
            },
          },
        },
      ],
    };

    console.log("Carmel Trip Cancel Payload:", JSON.stringify(payload));
    try {
      const response = await this.axiosClient.post("", payload);
      const result = response.data.results[0]?.data?.result;

      if (result?.code === "ERROR") {
        const errorMessage = result?.message || "Unknown error occurred";
        console.error(`Carmel API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (result?.code === "OK") {
        console.log(
          `Successfully cancelled the trip with Carmel API and response is  ${JSON.stringify(
            response.data.results[0]
          )}`
        );
        return response.data.results[0];
      }
    } catch (error) {
      console.error(
        "Error cancelling trip with Carmel:",
        error.response?.data || error.message
      );
      throw new Error("Failed to cancel trip with Carmel API.");
    }
  }
}
