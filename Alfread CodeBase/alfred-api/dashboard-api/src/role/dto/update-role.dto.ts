import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CreateRoleDTO } from './create-role.dto';

export class UpdateRoleDTO extends PartialType(CreateRoleDTO) {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty()
  version: number;
}
