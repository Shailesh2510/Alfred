import { IsNumber, IsString } from 'class-validator';

export class CreatePermissionDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  path: string;
}
