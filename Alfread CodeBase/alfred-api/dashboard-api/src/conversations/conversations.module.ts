import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "database/database.module";
import { AwsModule } from "src/aws/aws.module";
import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { cconversationsProviders } from "./conversations.providers";

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ...cconversationsProviders],
  exports: [ConversationsService],
})
export class ConversationsModule {}
