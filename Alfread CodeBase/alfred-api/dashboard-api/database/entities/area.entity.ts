import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { plainToClass } from "class-transformer";

@Entity("areas")
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 40000 })
  postal_codes: string;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Area, input, {
      excludeExtraneousValues: true,
    });
  }
}
