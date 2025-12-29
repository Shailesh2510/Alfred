import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { plainToClass } from "class-transformer";
import { AuditEntity } from "./audit.entity";

@Entity("campaign_area")
export class CampaignArea extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int4" })
  campaign_id: number;

  @Column({ type: "int4" })
  area_id: number;

  @Column({ type: "varchar", length: 100 })
  airport_code: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(CampaignArea, input, {
      excludeExtraneousValues: true,
    });
  }
}
