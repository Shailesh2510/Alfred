import { HOTEL_ARRIVALS_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { DataSource } from "typeorm";
import { HotelArrivals } from "database/entities/hotel_arrivals.entity";

export const conciergeProviders = [
  {
    provide: HOTEL_ARRIVALS_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(HotelArrivals),
    inject: [PG_DATA_SOURCE],
  },
];
