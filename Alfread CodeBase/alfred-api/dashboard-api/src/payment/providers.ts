import { PAYMENT_LOG_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { PaymentLog } from "database/entities/payment_log.entity";
import { DataSource } from "typeorm";

export const stripeServiceProviders = [
  {
    provide: PAYMENT_LOG_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentLog),
    inject: [PG_DATA_SOURCE],
  },
]
