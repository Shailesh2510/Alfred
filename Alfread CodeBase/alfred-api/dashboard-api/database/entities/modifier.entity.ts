import { plainToClass } from "class-transformer";
import { AuditEntity } from "./audit.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("modifiers")
export class Modifier extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column({
    name: "required_options",
  })
  requiredOptions: boolean;

  @Column({
    name: "multiple_options",
  })
  multipleOptions: boolean;

  @Column({
    name: "free_modifier_count",
    default: 0,
  })
  freeModifierCount: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Modifier, input, {
      excludeExtraneousValues: true,
    });
  }
}
