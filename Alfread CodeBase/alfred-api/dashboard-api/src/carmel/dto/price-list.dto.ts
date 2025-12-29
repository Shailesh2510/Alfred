import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsNumber, IsOptional } from "class-validator";

export class AddressHotelDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Street name of the hotel", required: false })
  streetName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "City name where the hotel is located",
    required: false,
  })
  cityName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Street number of the hotel", required: false })
  streetNumber?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: "Latitude of the hotel", required: false })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: "Longitude of the hotel", required: false })
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: "Indicates whether the address is an airport or not",
    required: false,
  })
  airport?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Flight number" })
  flightNumber?: string;
}
export class AddressAirportDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: "Indicates whether the address is an airport or not",
  })
  airport?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Airport code" })
  airportCode?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: "Latitude of the airport" })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: "Longitude of the airport" })
  longitude?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Flight number" })
  flightNumber?: string;
}

export class PriceListDto {
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
  @ApiProperty({
    description: "Date of the trip (MM/DD/YYYY)",
    required: false,
  })
  tripDate?: string;

  @IsString()
  @ApiProperty({ description: "Time of the trip (HH:mm)" })
  tripTime?: string;
}
