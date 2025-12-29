import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import {Twilio} from 'twilio';
import { MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";

@Injectable()
export class TwilioService {
  private readonly client: Twilio;
  private readonly logger = new Logger();
  constructor() {
    this.client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendSMS(params: MessageListInstanceCreateOptions) {
    try {
      return await this.client.messages.create({
        from: process.env.TWILIO_SMS_FROM_NUMBER,
        ...params,
      });
    } catch (err) {
      this.logger.error(`Failed triggering pusher event ${err.message}`)
    }
  }

  async verifyPhone(phoneNumber: string, countryCode: string = "US") {
    try {
      const response = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      if (response.countryCode != countryCode) {
        throw new HttpException(`Phone number ${phoneNumber} could not be verified`, HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      this.logger.error(`Failed twilio@verifyPhone ${err.message}`)
    }
    throw new HttpException(`Phone number ${phoneNumber} could not be verified`, HttpStatus.NOT_FOUND);
  }
}
