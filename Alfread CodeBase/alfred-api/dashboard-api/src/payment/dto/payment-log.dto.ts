import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentLogDTO {
  @ApiProperty()
  paymentIntentId: string

  @ApiProperty()
  paymentProvider: string;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  eventType: string

  @ApiProperty()
  status: string

  @ApiProperty()
  refundId?: string
}
