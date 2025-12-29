import { Entity, Column } from "typeorm";
import { plainToClass } from "class-transformer";
import { AuditEntity } from "./audit.entity";

@Entity("campaigns")
export class Campaign extends AuditEntity {
  @Column({ type: "int4", primary: true })
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text" })
  description: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Campaign, input, {
      excludeExtraneousValues: true,
    });
  }
}
