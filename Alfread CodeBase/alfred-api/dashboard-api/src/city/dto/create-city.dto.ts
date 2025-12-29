import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCityDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  state: string;

  @IsString()
  @ApiProperty()
  zipCode: string;

  @IsString()
  @ApiProperty()
  timezone: string;
}
