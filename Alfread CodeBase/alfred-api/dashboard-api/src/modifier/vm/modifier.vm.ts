import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseVM } from "../../base.vm";

export class ModifierOptionVM extends BaseVM {
  @ApiProperty()
  @IsNumber()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsString()
  @ApiProperty()
  @Expose()
  price: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(ModifierOptionVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class ModifierVM extends BaseVM {
  @ApiProperty()
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  version: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({
    type: ModifierOptionVM,
    isArray: true
  })
  @Type(() => ModifierOptionVM)
  @IsOptional()
  @Expose()
  options?: ModifierOptionVM[];

  @IsBoolean()
  @ApiProperty()
  @Expose({name: 'required_options'})
  requiredOptions: boolean;

  @IsBoolean()
  @ApiProperty()
  @Expose({name: 'multiple_options'})
  multipleOptions: boolean;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'free_modifier_count'})
  freeModifierCount: number;

  @ApiProperty()
  @Expose({name: 'created_at'})
  public createdAt: Date;

  @ApiProperty()
  @Expose({name: 'updated_at'})
  public updatedAt: Date;

  @ApiProperty()
  @Expose({name: 'deleted_at'})
  deletedAt?: Date;

  toVM<T>(input: T | T[]) {
    const data = plainToClass(ModifierVM, input, {
      excludeExtraneousValues: true,
    });
    if (data.options?.length) {
      data.options = data.options.filter((e: ModifierOptionVM) => e.id != null).map(e => new ModifierOptionVM(e).build())
    }
    return data;
  }
}
