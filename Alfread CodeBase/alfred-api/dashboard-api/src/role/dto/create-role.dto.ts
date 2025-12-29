import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber({}, { each: true })
  @ApiProperty()
  permissionIds: number[];

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string;
}
