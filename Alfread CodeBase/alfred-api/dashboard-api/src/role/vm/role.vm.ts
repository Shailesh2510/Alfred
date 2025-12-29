import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "../../base.vm";
import { ApiProperty } from "@nestjs/swagger";
import { PermissionVM } from "src/permission/vm/permission.vm";

export class RoleVM extends BaseVM {
  
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose({name: 'hotel_id'})
  hotelId: number;

  @ApiProperty()
  @Expose({name: 'merchant_id'})
  merchantId: number;

  @ApiProperty()
  @Expose()
  permissions: PermissionVM[]

  toVM<T>(input: T | T[]) {
    return plainToClass(RoleVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
