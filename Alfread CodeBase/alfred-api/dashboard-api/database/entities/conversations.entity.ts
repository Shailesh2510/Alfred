import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { AuditEntity } from "./audit.entity";
import { UserType } from "database/enums/usertype";

@Entity("conversations")
export class Conversations {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  user_id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  session_id?: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  timestamp: Date;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "enum", enum: UserType })
  role: UserType;

  @Column({ type: "boolean", nullable: true })
  vote?: boolean;
}
