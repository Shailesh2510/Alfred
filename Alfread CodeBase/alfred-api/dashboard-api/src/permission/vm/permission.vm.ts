import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass } from 'class-transformer';
import { BaseVM } from '../../base.vm';

export class PermissionVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  method: string;

  @ApiProperty()
  @Expose()
  description: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(PermissionVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
