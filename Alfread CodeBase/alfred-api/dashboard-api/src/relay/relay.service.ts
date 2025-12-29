import { Inject, Injectable } from "@nestjs/common";
import { RelayCreateOrderDTO, RelayUpdateOrderDTO } from "./relay.dto";
import { HTTPService } from "src/http/http.service";
import { getRelayApiKey, getRelayURL } from "helpers";
import { MerchantIdToRelayProducerLocationKeyMap } from "merchant-relay-plk-map";
import { HotelService } from "src/hotel/hotel.service";

@Injectable()
export class RelayService {
  @Inject(HTTPService)
  private readonly httpService: HTTPService;
  @Inject(HotelService)
  private readonly hotelService: HotelService;

  async createOrder(input: RelayCreateOrderDTO) {
    console.log(`input: `, input)
    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      body: JSON.stringify(input),
    };
    const response = await this.httpService.request(`${getRelayURL()}/order`, req);
    const body = await response.json()
    console.log(`RelayService@createOrder-response: `, {
      body: JSON.stringify(body)
    });
    //handle response
    return body;
  }

  async updateOrder(input: RelayUpdateOrderDTO) {
    console.log(`input: `, input)
    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'PATCH',
      body: JSON.stringify(input),
    };
    const response = await this.httpService.request(`${getRelayURL()}/order`, req);
    const body = await response.json()
    console.log(`RelayService@updateOrder-response: `, {
      body: JSON.stringify(body)
    });
    //handle response
    return body;
  }

  async getOrder(orderKey: string) {
    console.log(`orderKey: `, orderKey)
    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'GET',
    };
    const response = await this.httpService.request(`${getRelayURL()}/order/${orderKey}`, req);
    const body = await response.json()
    console.log(`RelayService@getOrder-response: `, {
      body: JSON.stringify(body)
    });
    //handle response
    return body;
  }

  async cancelOrder(orderKey: string) {
    console.log(`orderKey: `, orderKey)
    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      body: JSON.stringify({
        orderKey,
      }),
    };
    const response = await this.httpService.request(`${getRelayURL()}/order/void`, req);
    const body = await response.json()
    console.log(`RelayService@cancelOrder-response: `, {
      body: JSON.stringify(body)
    });
    //handle response
    return body;
  }

  /**
   * If you have an event for when an order is ready to be picked up then you can use this route to 
   * dramatically improve the quality of service your orders receive on the Relay Platform. 
   * Be sure to set requireReadyEvent to true when creating the order if you intend to use this method.
   */
  async toggleOrderReady(input: {orderKey: string; isReady: boolean}) {
    console.log(`input: `, input)
    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      body: JSON.stringify(input),
    };
    const response = await this.httpService.request(`${getRelayURL()}/order/ready`, req);
    const body = await response.json()
    console.log(`RelayService@toggleOrderReady-response: `, {
      body: JSON.stringify(body)
    });
    //handle response
    return body;
  }
  async getQuote(merchantId: number, hotelWebCode: string) {
    
    const hotel = await this.hotelService.findOne({
      where: {
        webCode: hotelWebCode,
      },
    });

    const req = {
      headers: {
        'x-relay-auth': getRelayApiKey(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      body: JSON.stringify({
        quote: {
          producer: {
            producerLocationKey: MerchantIdToRelayProducerLocationKeyMap[merchantId]
          },
          consumer: {
            location: {
              coordinates: {
                latitude: hotel.coordinates.x,
                longitude: hotel.coordinates.y
              }
            }
          }
        }
      })
    }
    const response = await this.httpService.request(`${getRelayURL()}/quote`, req);
    const body = await response.json()
    console.log("RelayService@canDeliverToAddress-response: ", {
      body: JSON.stringify(body)
    });
    
    return body;
  }
}
