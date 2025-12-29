import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsString()
  @ApiProperty()
  lastName: string;

  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsNumber()
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  hotelId?: number;

  @IsNumber()
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  merchantId?: number;

  @IsBoolean()
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserPasswordDTO {
  @IsString()
  @ApiProperty()
  password: string;

  @IsBoolean()
  @ApiProperty()
  permanent: boolean;
}
