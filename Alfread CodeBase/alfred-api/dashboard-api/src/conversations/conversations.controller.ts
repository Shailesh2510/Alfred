import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { RestApiResponse } from "helpers";
import { ConversationsService } from "./conversations.service";
import { CreateConversationDTO } from "./dto/create-conversation.dto";
import { GetConversationDTO } from "./dto/fetch-conversation.dto";

@ApiTags("Conversations")
@Controller("conversations")
@ApiBearerAuth()
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Post("create")
  @UseGuards(ApiKeyGuard)
  async createConversation(@Body() dto: CreateConversationDTO) {
    const conversation = await this.conversationService.create(dto);
    return RestApiResponse(conversation);
  }

  @Post("fetch")
  @UseGuards(ApiKeyGuard)
  async getConversations(@Body() dto: GetConversationDTO) {
    if (!dto.phoneNumber) {
      throw new HttpException(
        "Phone number is required",
        HttpStatus.BAD_REQUEST
      );
    }

    const conversations =
      await this.conversationService.getConversationsByPhoneNumber(
        dto.phoneNumber
      );
    return RestApiResponse(conversations);
  }
}
