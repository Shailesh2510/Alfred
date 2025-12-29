import { Injectable } from "@nestjs/common";
import * as FormData from "form-data";
import { getAlfredMailgunDomain } from "helpers";
import Mailgun from "mailgun.js";
import { IMailgunClient } from "mailgun.js/Interfaces";

@Injectable()
export class MailgunService {
  private mailgun: IMailgunClient;
  constructor() {
    this.mailgun = new Mailgun(FormData).client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    });
  }

  async sendEmail(input: { to: string; html: string; subject: string }) {
    if (process.env.NODE_ENV !== "prod") {
      return;
    }
    try {
      return await this.mailgun?.messages?.create(getAlfredMailgunDomain(), {
        to: input.to,
        html: input.html,
        subject: input.subject,
        from: "orders@getalfred.com",
      });
    } catch (err) {
      console.log(`Failed MailgunService@sendEmail: ${err}`);
    }
  }
}
