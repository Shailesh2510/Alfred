import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { BaseService } from "../base.service";
import { CONVERSATIONS_REPOSITORY } from "../../constants";
import { Conversations } from "database/entities/conversations.entity";
import { CreateConversationDTO } from "./dto/create-conversation.dto";
import { UserType } from "database/enums/usertype";

@Injectable()
export class ConversationsService extends BaseService<Conversations, {}, {}> {
  logger = new Logger();

  @Inject(CONVERSATIONS_REPOSITORY)
  private readonly conversationsRepository: Repository<Conversations>;

  async create(dto: CreateConversationDTO) {
    try {
      const savedConversation = await this.conversationsRepository.save(dto);
      return savedConversation;
    } catch (error) {
      throw new HttpException(
        "Failed to create conversation",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getConversationsByPhoneNumber(phoneNumber: string) {
    try {
      const conversations = await this.conversationsRepository
        .createQueryBuilder("c")
        .where("c.session_id = :phoneNumber", { phoneNumber })
        .orderBy("c.timestamp", "DESC")
        .limit(20)
        .getMany();

      return conversations.map((conv) => ({
        role: conv.role === UserType.GUEST_USER ? "User" : "Agent",
        content: conv.message,
      }));
    } catch (error) {
      throw new HttpException(
        "Failed to fetch conversations",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
