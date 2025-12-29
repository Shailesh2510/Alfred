import * as AWS from "aws-sdk";
import axios from "axios";
import { DateTime } from "luxon";

const getCloudBedsReservations = async (apiKey: string, propertyId: number, status: string, modifiedFrom: string) => {
    console.log("Getting data from CloudBeds...")
    let zone = "America/New_York";

    const result = await axios.get(
        "https://api.cloudbeds.com/api/v1.2/getReservations",
        {
            params: {
                propertyID: propertyId,
                status: status,
                modifiedFrom: modifiedFrom,
                includeGuestDetails: true
            },
            headers: {
                Authorization: `Bearer ${apiKey}`,
            }
        }
    );

    return result.data;
}

const postGuestCheckedInEventToKlaviyo = async (event: any) => {
    const input = JSON.parse(event.body);
    console.log(`Incoming-request: `, input);

    try {
        const zone = "America/New_York";
        const reservations = await getCloudBedsReservations(
            input.propertyID,
            input.status,
            DateTime.fromObject({zone}).format('YYYY-MM-DD'), 
            input.apiKey
        );

        console.log(`${reservations.length} reservations found. Sending events to Klaviyo...`);

        for (const reservation of reservations) {
            const guestInfo = reservation["guestList"].entries.next().value;
            const lengthOfStay = DateTime.fromISO(reservation["endDate"]).diff(DateTime.fromISO(reservation["startDate"]), "days").toObject()["days"];
            let voucherValue = 0;
            if (reservation["dateCreated"] > "2024-07-17") {
                voucherValue = input.baseValue * lengthOfStay;
            }

            const body = {
                data: {
                    type: "event",
                    attributes: {
                        properties: {
                            propertyName: input.propertyName,
                            propertyId: reservation["propertyID"],
                            reservationId: reservation["reservationID"],
                            guestName: reservation["guestName"],
                            checkInDate: reservation["startDate"],
                            checkOutDate: reservation["endDate"],
                            roomName: guestInfo["roomName"],
                            voucherValue: voucherValue,
                            guestPortal: "https://app.getalfred.com/H57?pms=true"
                        },
                        metric: {
                            data: {
                                type: "metric",
                                attributes: {
                                    name: "Guest Checked-In"
                                }
                            }
                        },
                        profile: {
                            data: {
                                type: "profile",
                                attributes: {
                                    first_name: guestInfo["guestFirstName"],
                                    last_name: guestInfo["guestLastName"],
                                    email: guestInfo["guestEmail"],
                                    phone_number: guestInfo["guestPhone"]
                                }
                            }
                        }
                    }
                }
            };

            const response = await axios.post("https://a.klaviyo.com/api/events/",
                {
                    body: body,
                    headers: {
                        Authorization: "Klaviyo-API-Key pk_c5ffee032f594f73598aaf8727fd28cc6a",
                        revision: "2024-07-15"
                    }
                }
            ); 

            return {
                statusCode: response.status
            };
        }   

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
}