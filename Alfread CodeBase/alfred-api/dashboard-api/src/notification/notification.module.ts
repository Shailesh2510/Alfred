import { Module } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { TwilioService } from './twilio.service';
import { MailgunService } from './mailgun.service';
import { ClicksendService } from './clicksend.service';

@Module({
  providers: [PusherService, TwilioService, MailgunService, ClicksendService],
  exports: [PusherService, TwilioService, MailgunService, ClicksendService],
})
export class NotificationModule {}
