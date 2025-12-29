import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";

import { ClicksendService } from "src/notification/clicksend.service";
import { IsNull, Not, Repository } from "typeorm";
import { Guest } from "../../database/entities/guest.entity";
import { HotelArrivals } from "database/entities/hotel_arrivals.entity";
import { BaseService } from "../base.service";
import {
  HOTEL_ARRIVALS_REPOSITORY,
  AWS_DEFAULT_REGION,
  CONCIERGE_BULK_SQS_QUEUE_URL,
} from "../../constants";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { CreateConciergeRequestDTO } from "./dto/create-concierge-request.dto";

@Injectable()
export class ConciergeService extends BaseService<Guest, {}, {}> {
  logger = new Logger();

  @Inject(ClicksendService)
  private readonly clicksendService: ClicksendService;
  @Inject(HOTEL_ARRIVALS_REPOSITORY)
  private readonly hotelArrivalsRepository: Repository<HotelArrivals>;

  async createConciergeRequest(guestDetails: CreateConciergeRequestDTO) {
    try {
      const guestObject = {
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: "",
        phoneNumber: guestDetails.phoneNumber,
        roomNumber: guestDetails?.roomNumber ?? null,
        hotelId: +guestDetails.hotelId,
      };

      const response = await this.hotelArrivalsRepository.save(guestObject);

      const welcomeMsg = `Hi ${guestDetails.firstName}, thank you for reaching out. I’m Alfred, your personal concierge. What can I help you with today?`;

      // Send welcome SMS to the subscribed guests
      await this.clicksendService.sendSMS({
        to: guestDetails.phoneNumber,
        message: welcomeMsg,
      });
      return {
        success: response ? true : false,
      };
    } catch (error) {
      this.logger.error(
        `Failed ConciergeService@createConciergeRequest: ${error}`
      );
      throw new HttpException(
        "Failed to create guest",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendBulkMessage(bulkMessageDetails: any) {
    try {
      const { message, daysBeforeCheckin } = bulkMessageDetails;
      const checkInDate = new Date(
        Date.now() + daysBeforeCheckin * 24 * 60 * 60 * 1000
      );

      const qb = this.hotelArrivalsRepository
        .createQueryBuilder()
        .select("DISTINCT ON (phone_number) *")
        .innerJoin("hotels", "h", "h.id = hotel_id")
        .where("arrival_date = :checkInDate")
        .andWhere("reservation_status = 'RESERVED'")
        .andWhere("phone_number IS NOT NULL")
        .setParameter("checkInDate", checkInDate);

      const guests = await qb.getRawMany();

      const sqs = new SQSClient({
        region: AWS_DEFAULT_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      for (const guest of guests) {
        // Enqueue to AWS SQS to be processed downstream
        const command = new SendMessageCommand({
          QueueUrl: CONCIERGE_BULK_SQS_QUEUE_URL,
          MessageBody: JSON.stringify({
            guest,
            message,
            hotelWebCode: guest.web_code,
            hotelName: guest.name,
          }),
        });

        const response = await sqs.send(command);
      }

      return {
        count: guests.length,
        message: "Bulk messages enqueued successfully",
      };
    } catch (error) {
      this.logger.error(`Failed ConciergeService@sendBulkMessage: ${error}`);
      throw new HttpException(
        "Failed to send bulk message",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendMessageToQueue(messageDTO: {
    message: string;
    sessionId: string;
    guest: {
      name: string;
      checkInDate: string;
      hotelWebCode: string;
      hotelName: string;
      email: string;
      lastMessage: string;
    };
  }) {
    try {
      const sqs = new SQSClient({
        region: AWS_DEFAULT_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      console.log(`Send Message to Queue: ${JSON.stringify(messageDTO)}`);

      const command = new SendMessageCommand({
        QueueUrl: process.env.CONCIERGE_AGENT_QUEUE_URL,
        MessageBody: JSON.stringify(messageDTO),
      });

      await sqs.send(command);

      return {
        message: "Messages enqueued successfully",
      };
    } catch (error) {
      this.logger.error(`Failed ConciergeService@sendMessageToQueue: ${error}`);
      throw new HttpException(
        "Failed to send message",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchCheckInDetails(phoneNumber: string) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const information = await this.hotelArrivalsRepository
      .createQueryBuilder("arrival")
      .leftJoinAndSelect("arrival.hotel", "hotel")
      .where(
        `
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(arrival.phoneNumber, '+', ''), '-', ''
              ), '(', ''
            ), ')', ''
          ), ' ', ''
        ) = :formattedPhone
      `,
        { formattedPhone }
      )
      .getOne();

    return information;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned;
  }
}
