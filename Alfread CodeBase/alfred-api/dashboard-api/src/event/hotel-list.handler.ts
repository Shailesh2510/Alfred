import { OnEvent } from "@nestjs/event-emitter";
import { HOTEL_CREATED_EVENT, HOTEL_UPDATED_EVENT } from "../../events";
import { Inject, Logger } from "@nestjs/common";
import { HotelService } from "src/hotel/hotel.service";
import { S3HotelVM } from "src/hotel/vm/hotel.vm";
import { S3Service } from "src/aws/s3.service";
import {
  DEFAULT_SYSTEM_TIMEZONE,
  GX_PHONE_NUMBER,
  getDeliveryFee,
  getHotelsS3Bucket,
  getHotelsS3BucketKey,
} from "helpers";

export class HotelListEventHandler {
  logger = new Logger();
  @Inject(HotelService)
  private hotelService: HotelService;
  @Inject(S3Service)
  private s3Service: S3Service;

  async regenerateHotelList() {
    const hotels = await this.hotelService.findAllWithRelations();
    const hotelsVM = new S3HotelVM(
      hotels.map((hotel) => ({
        ...hotel,
        deliveryFee: getDeliveryFee(hotel.has_delivery_fee, 0),
        hasDeliveryFee: hotel.has_delivery_fee,
        gxPhoneNumber: GX_PHONE_NUMBER,
        timezone: DEFAULT_SYSTEM_TIMEZONE,
      }))
    ).build();

    try {
      await this.s3Service.putObject({
        Bucket: getHotelsS3Bucket(),
        Key: getHotelsS3BucketKey(),
        Body: JSON.stringify(hotelsVM),
        ContentType: "application/json",
      });
    } catch (err) {
      this.logger.error(
        `HotelListEventHandler@regenerateHotelList: ${err.message}`
      );
    }
  }

  @OnEvent(HOTEL_CREATED_EVENT, { async: true })
  async onHotelCreated() {
    this.logger.log(`Event ${HOTEL_CREATED_EVENT} called`);
    await this.regenerateHotelList();
  }

  @OnEvent(HOTEL_UPDATED_EVENT, { async: true })
  async onHotelUpdated() {
    this.logger.log(`Event ${HOTEL_UPDATED_EVENT} called`);
    await this.regenerateHotelList();
  }
}
