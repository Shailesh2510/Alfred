import { IsNotEmpty, IsString } from "class-validator";

export class GetConversationDTO {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
