import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createHmac } from "crypto";
import { SecretsService } from "src/aws/secrets.service";
import { Request } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CARMEL_TRIP_STATUS_UPDATE_EVENT,
  ORDER_RELAY_STATUS_UPDATED_EVENT,
  ORDER_SHIPDAY_STATUS_UPDATED_EVENT,
  CLICK_SEND_REPLY_EVENT,
} from "../../events";
import { ShipdayDeliveryStatus } from "src/shipday/shipday.types";
import * as crypto from "crypto";
import { WebClient } from "@slack/web-api";
import { ConversationsService } from "src/conversations/conversations.service";
import { UserType } from "database/enums/usertype";
import { ClicksendService } from "src/notification/clicksend.service";

@ApiTags("Webhooks")
@Controller("webhook")
export class WebhookController {
  @Inject(SecretsService)
  private readonly secretsService: SecretsService;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2;
  @Inject(ConversationsService)
  private readonly conversationsService: ConversationsService;
  @Inject(ClicksendService)
  private readonly clicksendService: ClicksendService;

  private slack: WebClient;

  constructor() {
    this.slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  private async getRelayWebhookAuthenticationSecret() {
    const keys = await this.secretsService.getSecretValue(
      `${process.env.NODE_ENV}/encrypted-keys`
    );
    const secretParsed = JSON.parse(keys);
    return secretParsed.relay_webhook_auth_key;
  }

  private async isRelayWebhookAuth(body: any, headers: any) {
    const secret = await this.getRelayWebhookAuthenticationSecret();
    const signature = headers["x-relay-signature"] ?? "";
    const computedSignature = createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");
    return signature === computedSignature ? true : false;
  }

  private async isShipdayWebhookAuth(headers: any) {
    const secret = process.env.SHIPDAY_WEBHOOK_AUTH_KEY;
    const signature = headers["token"] ?? "";
    return secret === signature ? true : false;
  }

  private async isCarmelWebhookAuth(body: any, headers: any): Promise<boolean> {
    const secret = process.env.CARMEL_APP_SECRET;
    const signature = headers["x-carmel-signature"] ?? "";

    if (!secret || !signature) {
      return false;
    }

    try {
      const secretKeyBytes = Buffer.from(secret, "base64");
      const computedSignature = createHmac("sha256", secretKeyBytes)
        .update(body)
        .digest("base64");
      return signature === computedSignature;
    } catch (error) {
      console.error("Error in webhook authentication:", error);
      return false;
    }
  }

  @Post("relay")
  // @UseGuards(RelayApiKeyGuard)
  async handleRelayStatus(@Req() request: Request, @Body() dto: any) {
    console.log(`relay-webhook`);
    if (this.isRelayWebhookAuth(request.body, request.headers)) {
      console.log(`auth-webhook-input: `, JSON.stringify(dto));
      this.eventEmitter.emit(ORDER_RELAY_STATUS_UPDATED_EVENT, dto);
    } else {
      console.log(`non-auth-webhook-input: `, JSON.stringify(dto));
    }
    return true;
  }

  @Post("shipday/delivery-status")
  async handleDeliveryStatus(
    @Req() request: Request,
    @Body() statusUpdate: ShipdayDeliveryStatus
  ) {
    if (this.isShipdayWebhookAuth(request.headers)) {
      console.log(`auth-webhook-input: `, JSON.stringify(statusUpdate));
      this.eventEmitter.emit(ORDER_SHIPDAY_STATUS_UPDATED_EVENT, {
        event: statusUpdate.order_status,
        externalId: statusUpdate.order.order_number,
        shipdayResponse: statusUpdate,
      });
    } else {
      console.log("Invalid webhook secret received");
      throw new UnauthorizedException("Invalid webhook secret");
    }
    return true;
  }
  @Post("carmel")
  @HttpCode(200)
  async handleCarmelWebhook(@Req() request: Request) {
    const body = request.body;

    const isValid = await this.isCarmelWebhookAuth(
      JSON.stringify(request.body)
        .replace("\u2019", "\\\\u2019")
        .replace("Lic\\\\u2019", "Lic\\u2019"),
      request.headers
    );

    if (!isValid) {
      console.error("Invalid Carmel webhook signature");
      throw new UnauthorizedException("Invalid Carmel webhook signature");
    }

    this.eventEmitter.emit(CARMEL_TRIP_STATUS_UPDATE_EVENT, {
      event: body?.Trip?.tripStatus,
      carmelResponse: body,
    });

    return { success: true };
  }

  @Post("clicksend")
  async fetchClickSendSms(@Req() request: Request, @Body() dto: any) {
    console.log(`clickSendValues: `, JSON.stringify(dto));

    this.eventEmitter.emit(CLICK_SEND_REPLY_EVENT, dto);

    return { success: true };
  }

  @Post("clicksend-delivery-report")
  async clickSendDeliveryReport(@Req() request: Request, @Body() dto: any) {
    console.log(`clickSendDeliveryReport: `, JSON.stringify(dto));

    return { success: true };
  }

  @Post("slack")
  @HttpCode(200)
  async handleWebhook(@Req() request: Request) {
    const body = request.body;

    // URL Verification
    if (body.type === "url_verification") {
      return { challenge: body.challenge };
    }

    // Verify Slack signature
    this.verifySlackSignature(request);

    // Parse payload
    const payload = this.parsePayload(body);

    // Handle different event types
    return this.processSlackEvent(payload);
  }

  private verifySlackSignature(request: Request) {
    const signature = request.headers["x-slack-signature"] as string;
    const timestamp = request.headers["x-slack-request-timestamp"] as string;
    const rawBody = (request as any).rawBody || JSON.stringify(request.body);

    const sigBaseString = `v0:${timestamp}:${rawBody}`;
    const computedSig =
      "v0=" +
      crypto
        .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
        .update(sigBaseString)
        .digest("hex");

    if (
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig))
    ) {
      console.error("Invalid Slack signature");
      return { success: false, error: "Invalid signature" };
    }
  }

  private parsePayload(body: any) {
    return typeof body.payload === "string"
      ? JSON.parse(body.payload)
      : body.payload || body;
  }

  private async processSlackEvent(payload: any) {
    if (payload.type === "block_actions") {
      const action = payload.actions[0];

      switch (action.action_id) {
        case "modify_action":
          return this.openModifyModal(payload);

        case "approve_action":
          return this.handleApproveAction(action, payload);

        case "reject_action":
          return this.handleRejectAction(action, payload);
      }
    }

    if (payload.type === "view_submission") {
      return this.handleModalSubmission(payload);
    }

    return { success: false, message: "Unhandled event type" };
  }

  private async openModifyModal(payload: any) {
    try {
      const [actionType, sessionId, validationId] =
        payload.actions[0].value.split(":");

      const modalResponse = await this.slack.views.open({
        trigger_id: payload.trigger_id,
        view: {
          type: "modal",
          callback_id: "modify_response",
          title: {
            type: "plain_text",
            text: "Modify Response",
          },
          submit: {
            type: "plain_text",
            text: "Submit",
          },
          blocks: [
            {
              type: "input",
              block_id: "new_message_block",
              element: {
                type: "plain_text_input",
                action_id: "new_message_input",
                placeholder: {
                  type: "plain_text",
                  text: "Enter new message",
                },
                initial_value: payload.message.text,
              },
              label: {
                type: "plain_text",
                text: "New Message",
              },
            },
          ],
          private_metadata: JSON.stringify({
            sessionId,
            validationId,
            channelId: payload.channel.id,
            messageTs: payload.container.message_ts,
            messageBlocks: payload.message.blocks,
          }),
        },
      });

      return modalResponse;
    } catch (error) {
      console.error("Error opening modal:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async handleModalSubmission(payload: any) {
    const metadata = JSON.parse(payload.view.private_metadata);
    const { sessionId, validationId, channelId, messageTs, messageBlocks } =
      metadata;
    const newMessage =
      payload.view.state.values.new_message_block.new_message_input.value;
    console.log("Modal Submission Details:", {
      sessionId,
      validationId,
      newMessage,
    });
    await this.updateSlackMessage(
      channelId,
      messageTs,
      newMessage,
      messageBlocks,
      "✅ Modified"
    );

    try {
      const agentConversationPayload = {
        user_id: null,
        session_id: sessionId,
        message: payload.message.text,
        role: UserType.AGENT,
        vote: false,
      };

      await this.conversationsService.create(agentConversationPayload);

      if (process.env.NODE_ENV.toLowerCase() === "prod") {
        await this.clicksendService.sendSMS({
          to: sessionId,
          message: payload.message.text,
        });
      }

      const modifiedConversationsPayload = {
        user_id: null,
        session_id: sessionId,
        message: newMessage,
        role: UserType.TENANT_USER,
        vote: true,
      };

      await this.conversationsService.create(modifiedConversationsPayload);

      return {
        response_action: "clear",
      };
    } catch (error) {
      console.error("Error handling modify action:", error);
      return {
        response_action: "errors",
        errors: {
          new_message_block: "Failed to update. Please try again.",
        },
      };
    }
  }

  private async handleApproveAction(action: any, payload: any) {
    const [actionType, sessionId, validationId] =
      payload.actions[0].value.split(":");
    try {
      await this.updateSlackMessage(
        payload.channel.id,
        payload.container.message_ts,
        payload.message.text,
        payload.message.blocks,
        "✅ Approved"
      );

      if (process.env.NODE_ENV.toLowerCase() === "prod") {
        await this.clicksendService.sendSMS({
          to: sessionId,
          message: payload.message.text,
        });
      }

      const conversationsPayload = {
        user_id: null,
        session_id: sessionId,
        message: payload.message.text,
        role: UserType.AGENT,
        vote: true,
      };

      await this.conversationsService.create(conversationsPayload);

      return { success: true, message: "Approved" };
    } catch (error) {
      console.error("Error handling approve action:", error);
      return { success: false, error: error.message };
    }
  }

  private async handleRejectAction(action: any, payload: any) {
    const [actionType, sessionId, validationId] =
      payload.actions[0].value.split(":");
    try {
      // Update the original Slack message to reflect approval
      await this.updateSlackMessage(
        payload.channel.id,
        payload.container.message_ts,
        payload.message.text,
        payload.message.blocks,
        "❌ Rejected"
      );

      const conversationsPayload = {
        user_id: null,
        session_id: sessionId,
        message: payload.message.text,
        role: UserType.AGENT,
        vote: false,
      };

      await this.conversationsService.create(conversationsPayload);

      return { success: true, message: "Rejected" };
    } catch (error) {
      console.error("Error handling reject action:", error);
      return { success: false, error: error.message };
    }
  }

  private async updateSlackMessage(
    channelId: string,
    messageTs: string,
    messageText: string,
    messageBlocks: any,
    status: string
  ) {
    try {
      const updatedBlocks = [
        ...messageBlocks.filter((block: any) => block.type !== "actions"),
        {
          type: "section",
          text: { type: "mrkdwn", text: `*Status:* ${status}` },
        },
      ];

      const response = await this.slack.chat.update({
        channel: channelId,
        ts: messageTs,
        blocks: updatedBlocks,
        text: `${messageText || "Action completed"} - ${status}`,
      });

      console.log("Slack message updated successfully:", response);
    } catch (error) {
      console.error("Error updating Slack message:", error);
      throw error;
    }
  }
}
