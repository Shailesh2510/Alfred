import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateTripDto } from "src/carmel/dto/create-trip.dto";

export class APIInitPaymentInputDTO {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  orderId: string; //using order uuid here

  @ApiProperty()
  @IsString()
  paymentMethodType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentMethod: string;

  @ApiProperty()
  @IsString()
  clientName: string;

  @ApiProperty()
  @IsString()
  clientNumber: string;

  @ApiProperty()
  @IsString()
  clientEmail: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCateringOrder: boolean = false;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isRideService?: boolean = false;
}

export class APIConfirmPaymentInputDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  receiptEmail?: string;
}
