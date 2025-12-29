import * as api from "clicksend/api";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ClicksendService {
  private smsClient: api.SMSApi;
  private emailClient: api.TransactionalEmailApi

  constructor() {
    this.smsClient = new api.SMSApi(
      process.env.CLICKSEND_API_USERNAME,
      process.env.CLICKSEND_API_PASSWORD
    );

    this.emailClient = new api.TransactionalEmailApi(
      process.env.CLICKSEND_API_USERNAME,
      process.env.CLICKSEND_API_PASSWORD
    );
  }

  async sendSMS(input: { to: string; message: string }) {
    try {
      const smsMessage = new api.SmsMessage();

      smsMessage.source = "sdk";
      smsMessage.to = input.to;
      smsMessage.body = input.message;
      var smsCollection = new api.SmsMessageCollection();

      smsCollection.messages = [smsMessage];

      await this.smsClient.smsSendPost(smsCollection);
      console.log(
        `ClicksendService: `,
        JSON.stringify({ to: smsMessage.to, body: smsMessage.body })
      );
    } catch (err) {
      console.log(`Failed ClicksendService@sendSMS: ${err}`);
    }
  }

  async sendEmail(input: { recipient_email: string; recipient_name: string; subject: string; body: string }) {
    try {
      const emailMessage = new api.Email();

      emailMessage.to = [{ email: input.recipient_email, name: input.recipient_name}];

      emailMessage.from = {emailAddressId: "30688", name: "Alfred"};
      emailMessage.subject = input.subject;
      emailMessage.body = input.body;

      await this.emailClient.emailSendPost(emailMessage);
      console.log(
        `ClicksendService: `,
        JSON.stringify({
          to: emailMessage.to[0].email,
          name: emailMessage.to[0].name,
          subject: emailMessage.subject,
          body: emailMessage.body,
        })
      );
    } catch (err) {
      console.log(`Failed ClicksendService@sendEmail: ${err}`);
    }
  }
}
