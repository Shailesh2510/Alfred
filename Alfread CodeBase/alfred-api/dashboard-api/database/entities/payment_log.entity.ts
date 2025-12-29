import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum PaymentProvider {
  NONE = "NONE",
  STRIPE = "STRIPE",
}

@Entity("payment_logs")
export class PaymentLog {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "payment_intent_id" })
  paymentIntentId: string;

  @Column({ name: "payment_provider" })
  paymentProvider: string;

  @Column({ name: "order_id" })
  orderId: number;

  @Column({ name: "event_type" })
  eventType: string;

  @Column({ name: "status" })
  status: string;

  @Column({ name: "refund_id" })
  refundId: string;

  @Column({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "updated_at" })
  updatedAt: Date;
}
