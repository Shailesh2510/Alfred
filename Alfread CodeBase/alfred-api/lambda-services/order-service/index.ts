import { CreateOrderDTO } from "types";
import { validateOrReject } from "class-validator";
import { SQSClient, Message } from "@aws-sdk/client-sqs";
import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import * as twilio from "twilio";

enum SupportedStages {
  dev = "dev",
  prod = "prod",
}

// todo: replace with env
const defaultRegion = "us-east-1";
const getApiURL = (stage) => {
  return stage == "prod" ?
      `https://api.getalfred.com`
    : `https://${stage}.api.getalfred.com`;
};

const client = new SQSClient({
  region: defaultRegion,
});

const ssm = new AWS.SecretsManager({
  region: defaultRegion,
});

const validateStaging = () => {
  if (SupportedStages[process.env.STAGE] == undefined) {
    throw new Error(`Lambda not supported for ${process.env.STAGE}`);
  }
};

const getAWSSecrets = async () => {
  try {
    const secrets = await ssm
      .getSecretValue({
        SecretId: `${SupportedStages[process.env.STAGE]}/encrypted-keys`,
      })
      .promise();
    const secretValues = JSON.parse(secrets.SecretString);
    return secretValues;
  } catch (err) {
    console.log(`error@getAWSSecrets: `, JSON.stringify(err));
    throw new Error(`Failed to fetch secrets`);
  }
};

const getHotelByUuid = async (uuid: string) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.get(
      `${getApiURL(stage)}/gateway/hotel/public/${uuid}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return result.data.data?.length ? result.data.data[0] : null;
  } catch (err) {
    console.log(`error@getHotelByUuid: `, err);
  }
  return null;
};

export const getMerchantsByHotel = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const webCode: string = event.pathParameters.webCode;
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    if (!webCode) {
      throw new Error(`Invalid web code`);
    }

    const result = await axios.get(
      `${getApiURL(stage)}/gateway/hotel/public/get-merchants/${webCode}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(
      `result@getMerchantsByHotel: `,
      JSON.stringify(result.data.data)
    );
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(result.data.data),
    };
  } catch (err) {
    console.log(`error@getMerchantsByHotel: `, err);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: true,
        message: JSON.stringify(err),
      }),
    };
  }
  return null;
};

const getHotelPMSResponse = async (
  webCode: string,
  lastName: string,
  roomNumber: string
) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.get(
      `${getApiURL(
        stage
      )}/gateway/pms/public/${webCode}/${lastName}/${roomNumber}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data?.length ? result.data.data[0] : null;
  } catch (err) {
    console.log(`error@getHotelPMSResponse: `, err);
  }
  return null;
};

const verifyTwilioPhoneNumber = async (phoneNumber: string) => {
  const secrets = await getAWSSecrets();
  const twilioClient = twilio(
    secrets.TWILIO_ACCOUNT_SID,
    secrets.TWILIO_AUTH_TOKEN
  );
  const validNumber = await twilioClient.lookups._v1
    .phoneNumbers(phoneNumber)
    .toJSON();
  console.log(`twilio-valid-number: `, validNumber);
};

function convertTZ(date, tzString) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
}

export const createOrder = async (event: APIGatewayProxyEvent) => {
  const input: CreateOrderDTO = JSON.parse(event.body);
  console.log(`Incoming-request: `, input);
  validateStaging();
  console.log(`validate-or-reject`);
  await validateOrReject(input);
  if (!input.clientNumber) {
    throw new Error(`ClientNumber is required`);
  }
  if (!input.clientNumber.startsWith("+")) {
    throw new Error(
      `ClientNumber should contain prefix (+1) in format +12124567890`
    );
  }

  const secrets = await getAWSSecrets();
  if (!secrets.SQS_ORDER_QUEUE_URL) {
    throw new Error(`Configuration error`);
  }

  if (!input.hotelId) {
    throw new Error(`Hotel id required`);
  }
  const hotel = await getHotelByUuid(input.hotelId);
  console.log(`hotel: `, hotel);
  if (!hotel) {
    throw new Error(`Hotel not found`);
  }

  if (!hotel.mealPeriods) {
    throw new Error(`Hotel has no meal periods attached`);
  }

  if (input.timezone) {
    try {
      const orderingDateTime = convertTZ(new Date(Date.now()), input.timezone);
      hotel.mealPeriods?.forEach((mealPeriod) => {
        if (mealPeriod.id == input.mealPeriodId) {
          const orderingHour = orderingDateTime.getHours();
          const [mealPeriodStartHour] = mealPeriod.startHour.split(":");
          const [mealPeriodEndHour] = mealPeriod.endHour.split(":");

          if (
            orderingHour < mealPeriodStartHour ||
            orderingHour > mealPeriodEndHour
          ) {
            throw new Error(
              `Opening times violation - Start hour ${mealPeriodStartHour}, End hour ${mealPeriodEndHour}`
            );
          }
        }
      });
    } catch (err) {
      throw new Error(`Timezone input incorrect`);
    }
  }

  //`${uuid.v4().split('-')[2]}-${Date.now()}`;
  const nonce = `${Math.random().toString(36).slice(7).toUpperCase()}`;
  const createOrderPayload = {
    ...input,
    numberOfCutleries:
      input.numberOfCutleries ? input.numberOfCutleries.toString() : null,
    hotelId: hotel?.id, //todo: remove this for demo purposes
    merchantId: input.merchantId ? +input.merchantId : 0,
    rideGrandTotal: input.rideGrandTotal ? +input.rideGrandTotal : 0,
  };

  console.log(`Create order payload : ${JSON.stringify(createOrderPayload)}`);

  try {
    const stage = process.env.STAGE;
    const apiKey = secrets.orders_api_key;
    const result = await axios.post(
      `${getApiURL(stage)}/gateway/order/public/create-order/${nonce}`,
      createOrderPayload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ...result.data,
      }),
    };
  } catch (err) {
    console.error(`[error@client.send]: ${JSON.stringify(err)}`);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: true,
        message: JSON.stringify(err),
      }),
    };
  }
};

export const refundVoucherAmount = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const orderId: number = Number(event.pathParameters.orderId);
  validateStaging();
  console.log(`Incoming-refund-request: `, orderId);
  if (orderId <= 0) {
    throw new Error(`Invalid order id`);
  }

  const secrets = await getAWSSecrets();
  try {
    const stage = process.env.STAGE;
    const apiKey = secrets.orders_api_key;
    const result = await axios.put(
      `${getApiURL(stage)}/gateway/order/public/refund-voucher/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log("result data:", result);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ...result.data,
      }),
    };
  } catch (error) {
    console.log(`error@refundOrder: `, error);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: true,
        message: JSON.stringify(error),
      }),
    };
  }
};

export const getOrderStatus = async (event: APIGatewayProxyEvent) => {
  const orderNonceKey = event.pathParameters?.nonce;

  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;
  try {
    const result = await axios.get(
      `${getApiURL(stage)}/gateway/order/public/${orderNonceKey}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ...result.data,
        id: orderNonceKey,
      }),
    };
  } catch (err) {
    console.log(`error-fetch order: `, err);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: true,
      }),
    };
  }
};

const initPaymentRequest = async (input: any) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  return await axios.post(`${getApiURL(stage)}/payment/init`, input, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

function isValidEmail(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test the email against the regex
  return emailRegex.test(email);
}

export const initPayment = async (event: APIGatewayProxyEvent) => {
  const input = JSON.parse(event.body);
  //validate input params
  console.log("input: ", input);
  try {
    const result = await initPaymentRequest(input);
    console.log(`result: `, result.data);
    const statusCode = result.data.statusCode == 400 ? 400 : 200;
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(result.data),
    };
  } catch (err) {
    console.log(`error@initPayment: `, err);
  }

  return {
    statusCode: 500,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: "Failed to initiate payment",
    }),
  };
};

const getVoucherCodeAPI = async (code: string, hotelUuid: string) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;
  console.log(`code: `, code);
  try {
    const result = await axios.get(
      `${getApiURL(
        stage
      )}/gateway/voucher/code/public/${code}/hotel/${hotelUuid}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return result.data;
  } catch (err) {
    console.log(`error@getVoucherCode: `, err);
  }
  return null;
};

export const getVoucherCode = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const voucherCode = await getVoucherCodeAPI(
    event.pathParameters.code,
    event.pathParameters.uuid
  );
  console.log(`voucherCode: `, voucherCode);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      voucherCode ?
        JSON.stringify({
          ...voucherCode?.data[0],
        })
      : {
          message: "Service unavailable",
        },
  };
};

const getCityTimeAPI = async (uuid: string) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;
  try {
    const result = await axios.get(
      `${getApiURL(stage)}/gateway/city/public/${uuid}/time`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return result.data;
  } catch (err) {
    console.log(`error@getCityTime: `, err);
  }
  return null;
};

export const getCityTime = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const city = await getCityTimeAPI(event.pathParameters.uuid);
  console.log(`city: `, city);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      city ?
        JSON.stringify({
          ...city?.data[0],
        })
      : {
          message: "Service unavailable",
        },
  };
};

const getShipdayDeliveryFees = async (hotelId: any, merchantId: any) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.get(
      `${getApiURL(
        stage
      )}/gateway/shipday/get-delivery-fees/${hotelId}/${merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data ?? null;
  } catch (err) {
    console.log(`error@getShipdayDeliveryFees: `, err);
  }
  return null;
};

export const getHotelPMSGuest = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const data = await getHotelPMSResponse(
    event.pathParameters.webCode,
    event.pathParameters.lastName,
    event.pathParameters.roomNumber
  );
  console.log(`data: `, data);
  if (!data) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Data not found",
      }),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      data ?
        JSON.stringify({
          ...data,
        })
      : JSON.stringify({
          message: "Service unavailable",
        }),
  };
};

export const getDeliveryFees = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);

  if (!event.pathParameters) {
    console.log("Path parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameters" }),
    };
  }

  const availableDeliveryOptions = await getShipdayDeliveryFees(
    event.pathParameters.hotelId,
    +event.pathParameters.merchantId
  );

  console.log(
    `Delivery Option values : ${JSON.stringify(availableDeliveryOptions)}`
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      availableDeliveryOptions ?
        JSON.stringify({ ...availableDeliveryOptions })
      : JSON.stringify({ message: "Service unavailable" }),
  };
};

export const getAvailableRideOptions = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const priceListPayload = JSON.parse(event.body);
  if (!event.pathParameters) {
    console.log("Path parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameters" }),
    };
  }

  const availableRideOptions = await getCarmelPriceList(
    event.pathParameters.hotelId,
    priceListPayload
  );

  console.log(
    `Carmel Price List values are : ${JSON.stringify(availableRideOptions)}`
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      availableRideOptions ?
        JSON.stringify({
          rideOptions: availableRideOptions,
          fetchRidesSuccessful: true,
        })
      : JSON.stringify({
          message: "Service unavailable",
          fetchRidesSuccessful: false,
        }),
  };
};

const getCarmelPriceList = async (hotelWebCode: any, priceListPayload: any) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.post(
      `${getApiURL(stage)}/gateway/carmel/get-price-list/${hotelWebCode}`,
      priceListPayload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data ?? null;
  } catch (err) {
    console.log(`error@getCarmelPriceList: `, err);
  }
  return null;
};

export const getAssociatedMealPeriodsByMerchantId = async (
  event: APIGatewayProxyEvent
) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  if (!event.pathParameters) {
    console.log("Path parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameters" }),
    };
  }

  const associatedMealPeriods = await getMealPeriodsByMerchantId(
    event.pathParameters.merchantId
  );

  console.log(`Meal Periods are : ${JSON.stringify(associatedMealPeriods)}`);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      associatedMealPeriods ?
        JSON.stringify(associatedMealPeriods)
      : JSON.stringify({ message: "Service unavailable" }),
  };
};

const getMealPeriodsByMerchantId = async (merchantId: number) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.get(
      `${getApiURL(stage)}/gateway/hotel/public/get-mealperiods/${merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data ?? null;
  } catch (err) {
    console.log(`error@getMealPeriodsByMerchantId: `, err);
  }
  return null;
};

export const createCarmelTrip = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const createTripPayload = JSON.parse(event.body);
  if (!event.pathParameters) {
    console.log("Path parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameters" }),
    };
  }

  const createCarmelTrip = await createTrip(
    event.pathParameters.hotelId,
    createTripPayload
  );

  console.log(
    `Carmel Create Trip Response : ${JSON.stringify(createCarmelTrip)}`
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      createCarmelTrip ?
        JSON.stringify({
          response: createCarmelTrip,
          isCarmelTripCreated: true,
        })
      : JSON.stringify({
          message: "Service unavailable",
          isCarmelTripCreated: false,
        }),
  };
};

const createTrip = async (hotelWebCode: any, createTripPayload: any) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.post(
      `${getApiURL(stage)}/gateway/carmel/post-trip/${hotelWebCode}`,
      createTripPayload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data ?? null;
  } catch (err) {
    console.log(`error@createTrip: `, err);
  }
  return null;
};

export const cancelOrder = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.pathParameters);
  const cancelOrderPayload = JSON.parse(event.body);
  if (!event.pathParameters) {
    console.log("Path parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameters" }),
    };
  }

  const order = await cancelOrderByOrderId(
    event.pathParameters.orderId,
    cancelOrderPayload
  );

  console.log(`Cancel Order for order Id : ${event.pathParameters.orderId}`);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: order
      ? JSON.stringify({
          response: order,
          isOrderCancelled: true,
        })
      : JSON.stringify({
          message: "Service unavailable",
          isOrderCancelled: false,
        }),
  };
};

const cancelOrderByOrderId = async (orderId: any, cancelOrderPayload: any) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.post(
      `${getApiURL(stage)}/gateway/order/public/cancel-order/${orderId}`,
      cancelOrderPayload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return result.data ?? null;
  } catch (err) {
    console.log(`error@cancelOrder: `, err);
  }
  return null;
};

const getCanRelayDeliverToAddress = async (
  hotelWebCode: any,
  merchantId: any
) => {
  const secrets = await getAWSSecrets();
  const apiKey = secrets.orders_api_key;
  const stage = process.env.STAGE;

  try {
    const result = await axios.get(
      `${getApiURL(
        stage
      )}/gateway/relay/quote?hotelWebCode=${hotelWebCode}&merchantId=${merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`result: `, result);
    return result.data.data ?? null;
  } catch (err) {
    console.log(`error@getCanRelayDeliverToAddress: `, err);
  }
  return null;
};

export const getDeliveryQuote = async (event: APIGatewayProxyEvent) => {
  console.log(`event.path: `, event.path, event.queryStringParameters);

  if (!event.queryStringParameters) {
    console.log("Query string parameters are missing.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing query string parameters" }),
    };
  }

  const canRelayDeliverToAddress = await getCanRelayDeliverToAddress(
    event.queryStringParameters.hotelWebCode,
    +event.queryStringParameters.merchantId
  );

  console.log(
    `canRelayDeliverToAddress : ${JSON.stringify(canRelayDeliverToAddress)}`
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body:
      canRelayDeliverToAddress ?
        JSON.stringify({ ...canRelayDeliverToAddress })
      : JSON.stringify({
          message: "Service unavailable",
          error: "Failed to retrieve delivery quote",
        }),
  };
};

export const sendSMS = async (message: Message) => {
  console.log("incoming message : ", message);

    let count = 0;
    
    for (const record of message.Records) {
        console.log("record : ", record);

        const payload = JSON.parse(record.body);
        let msg = payload.message;
        const name = payload.guest.first_name;
        const hotel = payload.hotelName;
        const arrivalDate = payload.guest.arrival_date.split("T")[0];
        const departureDate = payload.guest.departure_date.split("T")[0];
        msg = msg.replace("{first_name}", name);
        msg = msg.replace("{hotel}", hotel);
        msg = msg.replace("{arrival_date}", arrivalDate);
        msg = msg.replace("{departure_date}", departureDate);
        console.log("Message sent : ", msg);
        const secrets = await getAWSSecrets();
        try {
            const token = Buffer.from(`${secrets.CLICKSEND_API_USERNAME}:${secrets.CLICKSEND_API_PASSWORD}`).toString("base64");
            const headers = {
                "Authorization": `Basic ${token}`,
            };
            
            const res = await axios.post('https://rest.clicksend.com/v3/sms/send', {
                messages: [
                    {
                        source: "api",
                        to: payload.guest.phone_number,
                        body: msg,
                    },
                ],
            }, { headers });
            
            console.log(`ClicksendService: `, JSON.stringify({ to: payload.guest.phone_number, body: msg }));
            count += 1;
            
        }
        catch (err) {
            console.log(`Failed ClicksendService@sendSMS: ${err}`);
        }

    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: {
            "count": count,
            "success": true
        }
    };
};




