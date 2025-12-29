
import { BaseService } from "src/base.service";
import { Repository } from "typeorm";
import { Inject } from "@nestjs/common";
import { PAYMENT_LOG_REPOSITORY } from "../../constants";
import { CreatePaymentLogDTO } from "./dto/payment-log.dto";
import { PaymentLog } from "database/entities/payment_log.entity";

export class PaymentLogService extends BaseService<PaymentLog, CreatePaymentLogDTO, {}> {
  @Inject(PAYMENT_LOG_REPOSITORY)
  protected _repository: Repository<PaymentLog>;
}
