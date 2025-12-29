import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsString,
} from "class-validator";
import { MerchantType } from "database/enums/merchantType";

export class CreateMerchantDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  coordinates: string;

  @IsString()
  @ApiProperty()
  cityId: number;

  @IsDecimal()
  @ApiProperty()
  taxRate: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  contactEmail: string;

  @IsString()
  @ApiProperty()
  contactPhone: string;

  @IsString()
  @ApiProperty()
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

  @IsBoolean()
  @ApiProperty()
  isActive: boolean;

  @IsBoolean()
  @ApiProperty()
  hasThirdPartyDelivery: boolean;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsString()
  coverImageUrl: string;

  @IsBoolean()
  @ApiProperty()
  allowCatering: boolean;

  @IsNumber()
  @ApiProperty()
  eta: number;

  @IsEnum(MerchantType)
  @ApiProperty({
    enum: MerchantType,
    enumName: "MerchantType",
  })
  merchantType: MerchantType;
}
