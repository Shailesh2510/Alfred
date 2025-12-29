import { Injectable, Logger } from "@nestjs/common";
import * as Pusher from "pusher";

@Injectable()
export class PusherService {
  private readonly client: Pusher;
  private readonly logger = new Logger();
  constructor() {
    this.client = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: Boolean(process.env.PUSHER_USE_TLS),
    });
  }

  async trigger(channel: string, event: string, payload: any) {
    try {
      await this.client.trigger(channel, event, payload);
    } catch (err) {
      this.logger.error(`Failed triggering pusher event ${err.message}`);
    }
  }
}
