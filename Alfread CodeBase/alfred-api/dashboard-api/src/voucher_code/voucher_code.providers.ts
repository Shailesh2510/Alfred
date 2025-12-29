import { PG_DATA_SOURCE, VOUCHER_CODE_REPOSITORY, VOUCHER_PROGRAM_HOTEL_REPOSITORY, VOUCHER_PROGRAM_REPOSITORY } from "../../constants";
import { DataSource } from "typeorm";
import { VoucherProgram } from "database/entities/voucher_program.entity";
import { VoucherCode } from "database/entities/voucher_code.entity";
import { VoucherProgramHotel } from "database/entities/voucher_program_hotel.entity";

export const voucherCodeProviders = [
  {
    provide: VOUCHER_PROGRAM_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VoucherProgram),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: VOUCHER_CODE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VoucherCode),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: VOUCHER_PROGRAM_HOTEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VoucherProgramHotel),
    inject: [PG_DATA_SOURCE],
  },
];
