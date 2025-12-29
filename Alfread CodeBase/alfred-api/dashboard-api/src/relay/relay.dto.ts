/**
 * Create Order Relay API  
 * {
    "order": {
      "externalId": "XJA-243",
      "consumer": {
        "name": "Larry",
        "phone": "34755555555",
        "location": {
          "address1": "245 west 25th Street",
          "city": "New York",
          "state": "New York",
          "zip": "10001"
        }
      },
      "producer": {
        "name": "Sandwich Store",
        "phone": "2125555555",
        "location": {
          "address1": "14 east 15th Street",
          "city": "New York",
          "state": "New York",
          "zip": "10003"
        }
      },
      "price": {
        "subTotal": 25,
        "tip": 4
      }
    }
  }
 */


export type RelayProducer = RelayConsumer;


export class RelayCreateOrderDTO {
  order: RelayCreateOrder;
}

export class RelayPrice {
  subTotal: number;
  tip: number;
  tax?: number;
}

export class RelayLocation {
  address1: string;
  city: string;
  state: string;
  zip: string;
}

export class RelayConsumer {
  name: string;
  phone: string;
  location: RelayLocation;
  producerLocationKey?: string;
}

export class RelayCreateOrder {
  requireReadyEvent: boolean;
  externalId: string;
  consumer: RelayConsumer;
  producer: RelayProducer;
  price: RelayPrice;
}

/**
 * Relay Update Order payload
 * {
  "order": {
    "price": {
      "subTotal": 33,
      "tax": 2.7,
      "tip": 7.5
    },
    "consumer": {
      "phone": "8885555555",
      "specialInstructions": "I'll be in the attic. Call me when you get here."
    }
  },
  "reason": "Customer service update. Customer got everything wrong."
}
 */

export class RelayUpdateOrderDTO {
  order: RelayUpdateOrder;
}

export class RelayUpdateOrderConsumer {
  phone: string;
  specialInstructions: string;
}

export class RelayUpdateOrder {
  price: RelayPrice;
  consumer: RelayUpdateOrderConsumer;
  reason: string;
}
