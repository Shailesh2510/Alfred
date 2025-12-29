import { DataSource } from "typeorm";
import { PG_DATA_SOURCE, CAMPAIGN_REPOSITORY } from "../../constants";
import { Campaign } from "database/entities/campaign.entity";

export const campaignProviders = [
  {
    provide: CAMPAIGN_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Campaign),
    inject: [PG_DATA_SOURCE],
  },
];
