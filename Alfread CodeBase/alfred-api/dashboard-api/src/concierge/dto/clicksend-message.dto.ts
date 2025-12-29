import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class ClickSendMessageDto {
  @IsString()
  @IsNotEmpty()
  originalsenderid: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  sms: string;

  @IsString()
  custom_string: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  original_message_id: string;

  @IsString()
  @IsNotEmpty()
  originalmessageid: string;

  @IsString()
  customstring: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  originalmessage: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  subaccount_id: string;

  @IsString()
  @IsNotEmpty()
  original_body: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  message_id: string;

  @IsBoolean()
  @IsOptional()
  isTestMessage?: boolean;
}
