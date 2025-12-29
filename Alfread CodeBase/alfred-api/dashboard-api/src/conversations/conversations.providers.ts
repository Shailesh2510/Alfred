import { CONVERSATIONS_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { DataSource } from "typeorm";
import { Conversations } from "database/entities/conversations.entity";

export const cconversationsProviders = [
  {
    provide: CONVERSATIONS_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Conversations),
    inject: [PG_DATA_SOURCE],
  },
];
