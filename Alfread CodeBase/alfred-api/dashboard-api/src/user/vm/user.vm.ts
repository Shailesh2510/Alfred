import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "../../../database/enums/usertype";
import { IsNumber, IsString } from "class-validator";
import { BaseVM } from "src/base.vm";
import { Expose, plainToClass } from "class-transformer";
import { RoleVM } from "src/role/vm/role.vm";

export class UserVM extends BaseVM {
  @ApiProperty()
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty()
  @IsString()
  @Expose({name: 'first_name'})
  firstName: string;

  @ApiProperty()
  @IsString()
  @Expose({name: 'last_name'})
  lastName: string;

  @ApiProperty()
  @IsString()
  @Expose()
  email: string;

  @ApiProperty()
  @IsString()
  @Expose()
  username: string;

  @ApiProperty()
  @IsString()
  @Expose({name: 'phone_number'})
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @Expose()
  type: UserType;

  @ApiProperty()
  @IsNumber()
  @Expose({name: 'hotel_id'})
  hotelId: number;

  @ApiProperty()
  @IsNumber()
  @Expose({name: 'merchant_id'})
  merchantId: number;

  @ApiProperty()
  @IsNumber()
  @Expose({name: 'is_active'})
  isActive: number;

  @ApiProperty()
  @IsNumber()
  @Expose({name: 'hotel_name'})
  hotelName: number;

  @ApiProperty()
  @IsNumber()
  @Expose({name: 'merchant_name'})
  merchantName: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(UserVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedUserVM extends UserVM {
  @ApiProperty()
  @Expose()
  role: RoleVM

  toVM<T>(input: T | T[]) {
    return plainToClass(DetailedUserVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
