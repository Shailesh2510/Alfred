import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsString } from "class-validator";
import { BaseVM } from "../../../src/base.vm";
import { AmountType } from "src/order/calculation";

export class VoucherCodeVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  code: string;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version:number;

  @ApiProperty()
  @Expose({name: 'voucher_program_id'})
  voucherProgramId: number;

  @ApiProperty()
  @Expose({name: 'voucher_program_type'})
  voucherProgramType: string;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'hotel_id'})
  hotelId: number;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'hotel_name'})
  hotelName: number;

  @IsDate()
  @ApiProperty()
  @Expose({name: 'claimed_date'})
  claimedDate: Date;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'amount_used'})
  amountUsed: number;

  @ApiProperty()
  @Expose({name: 'voucher_program_name'})
  voucherProgramName: number;

  @ApiProperty()
  @Expose({name: 'total_amount'})
  totalAmount: number;

  @ApiProperty()
  @Expose({name: 'order_ids'})
  orderIds: number[];
  
  @ApiProperty()
  @Expose({name: 'payer_percentage'})
  payerPercentage: number;

  @ApiProperty()
  @Expose({name: 'amount_type'})
  amountType: AmountType;

  @ApiProperty()
  @Expose()
  rules: OrderVoucherProgramRuleVM[];

  toVM<T>(input: T | T[]) {
    return plainToClass(VoucherCodeVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrderVoucherProgramRuleVM {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  @Expose({name: 'menu_category_ids'})
  menuCategoryIds: number[]

  @IsNumber()
  @ApiProperty()
  @Expose()
  quantity: number;

  @IsNumber()
  @ApiProperty()
  @Expose({name: 'max_price'})
  maxPrice: number
}

export class VoucherCodeOrderVM extends VoucherCodeVM {

}
