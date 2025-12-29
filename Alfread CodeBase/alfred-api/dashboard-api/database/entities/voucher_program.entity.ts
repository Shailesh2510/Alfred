import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./audit.entity";
import { DECIMAL_COLUMN } from "helpers";
import { plainToClass } from "class-transformer";
import { AmountType } from "src/order/calculation";

export enum VoucherProgramType {
  DISCOUNT = "DISCOUNT",
  PER_DIEM = "PER_DIEM",
  PRE_FIXE = "PRE_FIXE",
}

export enum VoucherProgramPayer {
  HOTEL = "HOTEL",
  ALFRED_PROGRAM = "ALFRED_PROGRAM",
  ALFRED_RECOVERY = "ALFRED_RECOVERY",
}

@Entity("voucher_programs")
export class VoucherProgram extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({
    enum: VoucherProgramType,
  })
  type: VoucherProgramType;

  @Column({
    enum: VoucherProgramPayer,
  })
  payer: VoucherProgramPayer;

  @Column({
    enum: AmountType,
    name: "amount_type",
  })
  amountType: AmountType;

  @Column({
    name: "payer_percentage",
  })
  payerPercentage: number;

  @Column(DECIMAL_COLUMN, {
    name: "total_amount",
  })
  totalAmount: number;

  @Column(DECIMAL_COLUMN, {
    name: "refund_amount",
  })
  refundAmount: number;

  @Column()
  description: string;

  @Column({
    name: "is_active",
  })
  isActive: boolean;

  toEntity<T>(input: T | T[]) {
    return plainToClass(VoucherProgram, input, {
      excludeExtraneousValues: true,
    });
  }
}
