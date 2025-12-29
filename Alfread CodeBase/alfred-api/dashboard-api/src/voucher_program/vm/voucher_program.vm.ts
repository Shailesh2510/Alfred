import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from "class-validator";
import { BaseVM } from "src/base.vm";
import {
  VoucherProgramPayer,
  VoucherProgramType,
} from "../../../database/entities/voucher_program.entity";

export class HotelVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(HotelVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class VoucherProgramRuleVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose({ name: "meal_period_id" })
  mealPeriodId: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  @Expose({ name: "category_ids" })
  categoryIds: number[];

  @IsNumber()
  @ApiProperty()
  @Expose()
  quantity: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "max_price" })
  maxPrice: number;

  toVM<T>(input: T | T[]) {
    return plainToClass(VoucherProgramRuleVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class VoucherProgramVM extends BaseVM {
  @IsNumber()
  @ApiProperty()
  @Expose()
  id: number;

  @IsString()
  @ApiProperty()
  @Expose()
  name: string;

  @IsNumber()
  @ApiProperty()
  @Expose()
  version: number;

  @IsEnum(VoucherProgramType)
  @ApiProperty()
  @Expose()
  type: VoucherProgramType;

  @IsEnum(VoucherProgramPayer)
  @ApiProperty()
  @Expose()
  payer: VoucherProgramPayer;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "payer_percentage" })
  payerPercentage: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "total_amount" })
  totalAmount: number;

  @IsNumber()
  @ApiProperty()
  @Expose({ name: "refund_amount" })
  refundAmount: number;

  @IsBoolean()
  @ApiProperty()
  @Expose({ name: "is_active" })
  isActive: boolean;

  @IsBoolean()
  @ApiProperty()
  @Expose({ name: "amount_type" })
  amountType: boolean;

  @ApiProperty()
  @Expose()
  rules: VoucherProgramRuleVM[];

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose({ name: "created_at" })
  createdAt: Date;

  @ApiProperty()
  @Expose({ name: "updated_at" })
  updatedAt: Date;

  @ApiProperty({ type: [HotelVM] })
  @Expose()
  @Type(() => HotelVM)
  hotels: HotelVM[];

  toVM<T>(input: T | T[]) {
    if (input && typeof (input as any).hotels === "string") {
      (input as any).hotels = JSON.parse((input as any).hotels);
    }
    return plainToClass(VoucherProgramVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedVoucherProgramVM extends VoucherProgramVM {
  @ApiProperty({ type: [VoucherProgramRuleVM] })
  @Expose()
  @Type(() => VoucherProgramRuleVM)
  rules: VoucherProgramRuleVM[];

  toVM<T>(input: T | T[]) {
    if (input && typeof (input as any).hotels === "string") {
      (input as any).hotels = JSON.parse((input as any).hotels);
    }
    return plainToClass(DetailedVoucherProgramVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
