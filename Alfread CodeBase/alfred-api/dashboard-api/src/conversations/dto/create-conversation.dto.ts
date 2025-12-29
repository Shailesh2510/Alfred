import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserType } from "database/enums/usertype";

export class CreateConversationDTO {
  @ApiProperty({ example: 1, description: "User ID", required: false })
  @IsOptional()
  user_id?: number;

  @ApiProperty({
    example: "abc-123-session",
    description: "Session ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiProperty({
    example: "Hello, how can I help you?",
    description: "Message content",
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: "USER",
    enum: UserType,
    description: "Role of the user",
  })
  @IsEnum(UserType)
  role: UserType;

  @ApiProperty({ example: true, description: "Vote", required: false })
  @IsOptional()
  vote?: boolean;
}
