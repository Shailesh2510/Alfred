import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { AddressHotelDto, AddressAirportDto } from "./price-list.dto";

class PhoneDto {
  @IsString()
  @ApiProperty({ description: "Phone number" })
  number: string;

  @IsString()
  @ApiProperty({ description: "Country code" })
  countryCode: string;
}

export class CreateTripDto {
  @IsString()
  @ApiProperty({ description: "Order Nonce " })
  nonce: string;

  @IsOptional()
  @ApiProperty({
    description: "Address from where the trip starts",
    required: false,
  })
  addressFrom?: AddressHotelDto | AddressAirportDto;

  @IsOptional()
  @ApiProperty({
    description: "Address to where the trip ends",
    required: false,
  })
  addressTo?: AddressHotelDto | AddressAirportDto;

  @IsString()
  @ApiProperty({ description: "Date of the trip (MM/DD/YYYY)" })
  tripDate: string;

  @IsString()
  @ApiProperty({ description: "Time of the trip (HH:mm)" })
  tripTime: string;
  @IsString()
  @ApiProperty({ description: "First Name of the passenger" })
  customerFirstName: string;

  @IsString()
  @ApiProperty({ description: "Last Name of the passenger" })
  customerLastName: string;

  @ValidateNested()
  @Type(() => PhoneDto)
  @ApiProperty({ description: "Phone number details" })
  customerPhone: PhoneDto;

  @IsString()
  @ApiProperty({ description: "Email address of the passenger" })
  emailAddr: string;

  @IsString()
  @ApiProperty({ description: "Car class ID" })
  carClassID: string;

  @IsString()
  @ApiProperty({ description: "Fare Id" })
  fareId: string;
}
