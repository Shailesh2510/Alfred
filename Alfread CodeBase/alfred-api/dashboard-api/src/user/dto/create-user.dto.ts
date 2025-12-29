import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @ApiProperty()
  email: string;

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
  roleId: number;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isActive: boolean;
}

export class TenantCreateUserDTO extends CreateUserDTO {
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  merchantId?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  hotelId?: number;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isActive: boolean;
}
