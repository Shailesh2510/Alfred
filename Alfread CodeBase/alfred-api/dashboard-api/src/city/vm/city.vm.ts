import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass } from 'class-transformer';
import { BaseVM } from '../../base.vm';

export class CityVM extends BaseVM {
  constructor(input: any | any[]) {
    super(input);
  }
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  version: number;

  @ApiProperty()
  @Expose()
  state: string;

  @ApiProperty()
  @Expose()
  zipCode: string;

  @ApiProperty()
  @Expose()
  timezone: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(CityVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
