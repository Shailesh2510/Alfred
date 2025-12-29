import { Injectable, Inject, Logger } from "@nestjs/common";import { Order } from "database/entities/order.entity";
import {
  VoucherProgramPayer,
  VoucherProgramType,
} from "database/entities/voucher_program.entity";
import Decimal from "decimal.js-light";
import { getCloudBedsURL, getDateWithoutTime } from "helpers";
import { PmsHotelPropertyMap } from "pms";
import { HTTPService } from "src/http/http.service";
import { AmountType } from "src/order/calculation";
import { OrderItemVM } from "src/order/vm/order-item.vm";
import { VoucherCodeService } from "src/voucher_code/voucher_code.service";
import { VoucherProgramService } from "src/voucher_program/voucher_program.service";
import { ILike } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export enum PMSGuestStatus {
  CHECKED_IN = "checked_in",
}

@Injectable()
export class PMSService {
  @Inject(HTTPService)
  private readonly httpService: HTTPService;
  @Inject(VoucherProgramService)
  private readonly voucherProgramService: VoucherProgramService;
  @Inject(VoucherCodeService)
  private readonly voucherCodeService: VoucherCodeService;
  private logger = new Logger();

  private async httpGetReservations(input: {
    status: string;
    lastName: string;
    propertyId: string;
    apiKey: string;
    roomName: string;
  }) {
    try {
      const url =
        `${getCloudBedsURL()}/getReservations?` +
        new URLSearchParams({
          propertyID: input?.propertyId,
          status: input?.status,
          lastName: input?.lastName,
          roomName: input?.roomName,
        });
      this.logger.log("httpGetReservations: ", url);
      const response = await this.httpService.request(url, {
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
        },
      });
      return await response.json();
    } catch (err) {
      // log err
    }
  }

  private async httpGetReservationDetails(input: {
    reservationId: string;
    propertyId: string;
    apiKey: string;
  }) {
    try {
      const url =
        `${getCloudBedsURL()}/getReservation?` +
        new URLSearchParams({
          propertyID: input?.propertyId,
          reservationID: input?.reservationId,
          includeGuestDetails: "true",
        });
      this.logger.log("httpGetReservationDetails: ", url);
      const response = await this.httpService.request(url, {
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
        },
      });
      return await response.json();
    } catch (err) {
      // log err
    }
  }

  async getPmsIntegration(
    hotelWebCode: string,
    lastName: string,
    roomNumber: string
  ) {
    const property = PmsHotelPropertyMap[hotelWebCode];
    if (!property) {
      return null;
    }

    const reservationsResponse = await this.httpGetReservations({
      status: PMSGuestStatus.CHECKED_IN,
      lastName: lastName,
      propertyId: property.id,
      apiKey: property.apiKey,
      roomName: roomNumber,
    });
    console.log("reservationsResponse: ", JSON.stringify(reservationsResponse));
    if (!reservationsResponse.success) {
      return null;
    }

    // we assume it's the first one - was not specified there might be more
    const reservation = reservationsResponse?.data?.[0] ?? null;

    if (!reservation) {
      return null;
    }

    console.log(`reservation: `, JSON.stringify(reservation));
    const reservationDetailsResponse = await this.httpGetReservationDetails({
      reservationId: reservation?.reservationID,
      propertyId: property.id,
      apiKey: property.apiKey,
    });

    console.log(
      `reservationDetailsResponse: `,
      JSON.stringify(reservationDetailsResponse)
    );
    if (!reservationDetailsResponse?.success) {
      return null;
    }

    const reservationDetails = reservationDetailsResponse?.data ?? null;
    console.log(`reservationDetails: `, JSON.stringify(reservationDetails));

    if (reservationDetails) {
      const firstKey = Object.keys(reservationDetails?.guestList)[0];
      const firstGuestListDetails = reservationDetails?.guestList[firstKey];
      const roomName = firstGuestListDetails?.roomName ?? "";
      this.logger.log("pms-room-name: ", roomName);
      if (
        roomNumber.toLowerCase().replace(/\s+/g, "") !=
        roomName.toLowerCase().replace(/\s+/g, "")
      ) {
        this.logger.log(
          "Invalid reservation: ",
          JSON.stringify(firstGuestListDetails)
        );
        return null;
      }
      if (
        !property.pmsLiveDate ||
        new Date(reservationDetails.dateCreated).getTime() <=
          new Date(property.pmsLiveDate).getTime()
      ) {
        return {
          guestName: firstGuestListDetails?.guestName,
          guestEmail: firstGuestListDetails?.guestEmail,
          guestPhone: firstGuestListDetails?.guestPhone,
          roomNumber: roomNumber,
          voucherCode: null,
        };
      }
      const assignedRoom = reservationDetails?.assigned?.[0] ?? null;
      const voucherProgramName = `PMS-INTEGRATION-${hotelWebCode}-${reservationDetails?.reservationID}-VOUCHER-PROGRAM`;
      let voucherProgram = null;

      let canGenerateCode = true;
      let generatedCodes = [];
      if (assignedRoom) {
        const now = new Date(Date.now());
        const startDate = new Date(assignedRoom.startDate);
        const endDate = new Date(assignedRoom.endDate);
        const numberOfDays =
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        try {
          voucherProgram = await this.voucherProgramService.findOne({
            where: {
              name: voucherProgramName,
            },
          });
        } catch (err) {
          console.log(
            `Voucher program not found for ${voucherProgramName}. Error: `,
            JSON.stringify(err)
          );
        }
        if (voucherProgram == null) {
          // create voucher program
          voucherProgram = await this.voucherProgramService.create({
            name: voucherProgramName,
            description: "Automatically created voucher program",
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PER_DIEM,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            totalAmount: property.totalVoucherAmount * numberOfDays,
            hotelIds: null,
            hotelWebCode: hotelWebCode,
            isActive: true,
          });
        }
        try {
          // create voucher code
          const voucherCode = await this.voucherCodeService.findOne({
            where: {
              voucherProgramId: voucherProgram.id,
              lastName: ILike(lastName),
              hotelWebCode: ILike(hotelWebCode),
              dateAllowed: assignedRoom.endDate,
            },
          });
          if (voucherCode) {
            canGenerateCode = false;
            generatedCodes = [voucherCode];
          }
        } catch (err) {
          // voucher code does not exist
          this.logger.log("cant-find-voucher-code", err);
        }
        this.logger.log("canGenerateCode: ", canGenerateCode);
        this.logger.log("now: ", now);
        this.logger.log("startDate: ", startDate);
        this.logger.log("endDate: ", endDate);

        if (canGenerateCode) {
          generatedCodes = await this.voucherCodeService.generate({
            voucherProgramId: voucherProgram.id,
            hotelId: property.hotelId,
            numberOfCodes: 1,
            roomNumber: roomNumber,
            lastName: lastName,
            hotelWebCode: hotelWebCode,
            dateAllowed: assignedRoom.endDate,
          });
        }
      }
      console.log("firstGuestListDetails: ", firstGuestListDetails);
      return {
        guestName: reservationDetails?.guestName,
        guestEmail: reservationDetails?.guestEmail,
        guestPhone: firstGuestListDetails?.guestPhone,
        roomNumber: roomNumber,
        voucherCode: generatedCodes?.[0]?.code ?? null,
      };
    }

    return reservationDetails;
  }

  async postPmsCustomItems(
    hotelWebCode: string,
    orderItems: OrderItemVM[],
    order: Order
  ) {
    const property = PmsHotelPropertyMap[hotelWebCode];
    const data = new URLSearchParams();
    data.append("reservationID", "6211273390176");
    orderItems.forEach((orderItem, idx) => {
      // let description = ``;
      // orderItem.modifiers.forEach((modifier) => {
      //   modifier.options.forEach((option) => {
      //     description += `{Modifier option name: "${option.modifierOptionName}", Quantity: "${option.quantity}", Price: "${option.price}"}`
      //   })
      // })
      data.append(`items[${idx}][appItemID]`, `${orderItem.id}`);
      data.append(`items[${idx}][itemQuantity]`, `${orderItem.quantity}`);
      data.append(`items[${idx}][itemPrice]`, `${orderItem.price}`);
      data.append(`items[${idx}][itemName]`, `${orderItem.itemName}`);
      // data.append(`items[${idx}][description]`, description);
    });
    const finalIndex = orderItems.length;
    data.append(`items[${finalIndex}][appItemID]`, `${uuidv4()}`);
    data.append(`items[${finalIndex}][itemQuantity]`, `1`);
    data.append(`items[${finalIndex}][itemPrice]`, `${order.grandTotal}`);
    data.append(`items[${finalIndex}][itemName]`, `grandTotal`);

    data.append(`items[${finalIndex + 1}][appItemID]`, `${uuidv4()}`);
    data.append(`items[${finalIndex + 1}][itemQuantity]`, `1`);
    data.append(`items[${finalIndex + 1}][itemPrice]`, `${order.deliveryFee}`);
    data.append(`items[${finalIndex + 1}][itemName]`, `deliveryFee`);

    data.append(`items[${finalIndex + 2}][appItemID]`, `${uuidv4()}`);
    data.append(`items[${finalIndex + 2}][itemQuantity]`, `1`);
    data.append(`items[${finalIndex + 2}][itemPrice]`, `${order.taxAmount}`);
    data.append(`items[${finalIndex + 2}][itemName]`, `taxAmount`);

    data.append(`items[${finalIndex + 3}][appItemID]`, `${uuidv4()}`);
    data.append(`items[${finalIndex + 3}][itemQuantity]`, `1`);
    data.append(`items[${finalIndex + 3}][itemPrice]`, `${order.tip}`);
    data.append(`items[${finalIndex + 3}][itemName]`, `tip`);

    try {
      const url = `${getCloudBedsURL()}/postCustomItem?propertyID=${
        property.id
      }`;
      this.logger.log("postCustomItem: ", url);
      const response = await this.httpService.request(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${property.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString(),
      });
      console.log(`postPmsCustomItems-body: `, data.toString());
      return await response.json();
    } catch (err) {
      console.log("error@postToPms: ", err);
      // log err
    }
    return {
      success: false,
    };
  }

  async postPayment(hotelWebCode: string, voucherCode: string) {
    const property = PmsHotelPropertyMap[hotelWebCode];
    const data = new URLSearchParams();
    data.append("reservationID", "6211273390176");
    data.append(`amount`, `${property.totalVoucherAmount}`);
    data.append(`type`, `Voucher`);
    data.append(
      `description`,
      `Alfred Voucher Credit. Voucher Code: ${voucherCode}`
    );
    try {
      const url = `${getCloudBedsURL()}/postPayment?propertyID=${property.id}`;
      this.logger.log("postPayment: ", url);
      const response = await this.httpService.request(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${property.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString(),
      });
      return await response.json();
    } catch (err) {
      console.log("error@postPayment: ", err);
      // log err
    }
    return {
      success: false,
    };
  }

  async postToPms(
    hotelWebCode: string,
    orderItems: OrderItemVM[],
    order: Order
  ) {
    const customItemsResponse = await this.postPmsCustomItems(
      hotelWebCode,
      orderItems,
      order
    );
    console.log(`customItemsResponse: `, customItemsResponse);
    if (customItemsResponse.success && order.voucherCode) {
      if (
        new Decimal(order.appliedVoucherAmount).comparedTo(new Decimal(0)) >= 0
      ) {
        const postPaymentResponse = await this.postPayment(
          hotelWebCode,
          order.voucherCode
        );
        console.log(`postPaymentResponse: `, postPaymentResponse);
        if (!postPaymentResponse.success) {
          console.log("PMS PostPayment failed");
        }
      }
    } else {
      console.log("PMS PostCustomItem failed");
    }
  }
}
