import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { plainToClass } from "class-transformer";
import { AuditEntity } from "./audit.entity";

@Entity("referrals")
export class Referral extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  ambassador_id: string;

  @Column({ type: "varchar", length: 50 })
  campaign_id: string;

  @Column({ type: "varchar", length: 100 })
  ambassador_name: string;

  @Column({ type: "varchar", length: 50 })
  short_code: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Referral, input, {
      excludeExtraneousValues: true,
    });
  }
}
