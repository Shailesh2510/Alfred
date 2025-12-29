import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHotelDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  @MaxLength(8)
  addressNumber: string;

  @IsString()
  @ApiProperty()
  addressStreet: string;

  @IsString()
  @ApiProperty()
  addressTown: string;

  @IsString()
  @ApiProperty()
  addressZipCode: string;

  @IsString()
  @ApiProperty()
  contactName: string;

  @IsString()
  @ApiProperty()
  contactEmail: string;

  @IsString()
  @ApiProperty()
  contactPhone: string;

  @IsString()
  @ApiProperty()
  billingEmail: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  code?: string;

  @IsString()
  @ApiProperty()
  webCode: string;

  @IsBoolean()
  @ApiProperty()
  allowCreditCard: boolean;

  @IsBoolean()
  @ApiProperty()
  allowRoomCharge: boolean;

  @IsBoolean()
  @ApiProperty()
  isTaxExempt: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ApiProperty()
  rooms: string[];

  @IsString()
  @ApiProperty()
  coordinates: string;

  @IsBoolean()
  @ApiProperty()
  isActive: boolean;

  @IsString()
  @ApiProperty()
  deliveryInstructions: string;

  @IsBoolean()
  @ApiProperty()
  isWebEnabled: boolean;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  hasCutlery?: boolean = false;

  @IsNumber()
  @ApiProperty()
  cityId: number;

  @IsBoolean()
  @ApiProperty()
  hasThirdPartyDelivery: boolean;

  @IsBoolean()
  @ApiProperty()
  hasDeliveryFee: boolean;

  @IsBoolean()
  @ApiProperty()
  enableAutomaticTip: boolean = false;
}
