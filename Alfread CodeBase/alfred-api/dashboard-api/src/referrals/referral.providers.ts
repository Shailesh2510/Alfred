import { DataSource } from "typeorm";
import { PG_DATA_SOURCE, REFERRAL_REPOSITORY } from "../../constants";
import { Referral } from "database/entities/referral.entity";

export const referralProviders = [
  {
    provide: REFERRAL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Referral),
    inject: [PG_DATA_SOURCE],
  },
];
