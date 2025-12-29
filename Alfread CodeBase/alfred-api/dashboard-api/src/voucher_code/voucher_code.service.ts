import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  PG_DATA_SOURCE,
  VOUCHER_CODE_REPOSITORY,
  VOUCHER_PROGRAM_HOTEL_REPOSITORY,
  VOUCHER_PROGRAM_REPOSITORY,
} from "../../constants";
import { DataSource, In, QueryRunner, Repository } from "typeorm";
import { getPaginationData } from "../../pagination";
import { VoucherCode } from "../../database/entities/voucher_code.entity";
import {
  VoucherProgram,
  VoucherProgramType,
} from "../../database/entities/voucher_program.entity";
import {
  CreateVoucherCodeDTO,
  ListVoucherCodeFilters,
} from "./dto/create-voucher-code.dto";
import { VoucherProgramHotel } from "database/entities/voucher_program_hotel.entity";
import { BaseService } from "src/base.service";
import { getDateWithoutTime, toUTC } from "helpers";
import { OrderStatusEnum } from "database/entities/order.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { REFUND_VOUCHER_BY_ORDER } from "../../events";

const MAX_CODE_GENERATION_LIMIT = 100;

@Injectable()
export class VoucherCodeService extends BaseService<
  VoucherCode,
  CreateVoucherCodeDTO,
  {}
> {
  logger = new Logger();
  @Inject(VOUCHER_CODE_REPOSITORY)
  protected _repository: Repository<VoucherCode>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(VOUCHER_CODE_REPOSITORY)
  private readonly voucherCodeRepository: Repository<VoucherCode>;
  @Inject(VOUCHER_PROGRAM_REPOSITORY)
  private readonly voucherProgramRepository: Repository<VoucherProgram>;
  @Inject(VOUCHER_PROGRAM_HOTEL_REPOSITORY)
  private readonly voucherProgramHotelRepository: Repository<VoucherProgramHotel>;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2;

  private getQueryBuilder(hotelId?: number, filters?: ListVoucherCodeFilters) {
    let qb = this.connection
      .createQueryBuilder()
      .select(
        `
        vc.*,
        vc.amount_used,
        h.id as hotel_id,
        h.name as hotel_name,
        vp.name as voucher_program_name,
        vp.type as voucher_program_type,
        vp.payer_percentage,
        vp.total_amount,
        array_agg(o.id) as order_ids
      `
      )
      .from("voucher_codes", "vc")
      .innerJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .innerJoin(
        "voucher_program_hotel",
        "vph",
        "vph.voucher_program_id = vp.id"
      )
      .innerJoin("hotels", "h", "h.id = vph.hotel_id")
      .leftJoin(`order_items`, `oi`, `oi.voucher_code_id = vc.id`)
      .leftJoin(`orders`, `o`, `o.voucher_code_id = vc.id`)
      .groupBy(`vc.id, vp.id, h.id`)
      .orderBy("vc.created_at", "DESC");

    if (hotelId) {
      qb = qb
        .andWhere("vph.hotel_id = :hotelId")
        .setParameter("hotelId", hotelId);
    }
    if (filters?.code) {
      qb = qb
        .andWhere("vc.code like :code")
        .setParameter("code", `${filters?.code}%`);
    }
    if (filters?.voucherProgramId) {
      qb = qb
        .andWhere("vp.id = :voucherProgramId")
        .setParameter("voucherProgramId", filters?.voucherProgramId);
    }
    if (filters?.claimed === "true") {
      qb = qb.andWhere("vc.claimed_date is not null");
    }
    return qb;
  }

  async findAll(hotelId: number, filters?: ListVoucherCodeFilters) {
    let skip,
      take = null;
    const page = filters?.page ?? 0;
    if (page) {
      const paginationData = getPaginationData(page);
      skip = paginationData.skip;
      take = paginationData.take;
    }
    const qb = this.getQueryBuilder(hotelId, filters);
    const [data, total] = await Promise.all([
      skip && take ? qb.limit(take).offset(skip).getRawMany() : qb.getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }

  async findByCode(code: string, hotelUuid: string) {
    const refundOrders = await this.initiatedOrdersByVoucher(code);
    if (refundOrders.length > 0)
      this.eventEmitter.emit(REFUND_VOUCHER_BY_ORDER, [...refundOrders]);
    const result = await this.voucherCodeRepository.query(
      `
      select
      vc.id,
      vc.code,
      vc.claimed_date,
      vc.date_allowed,
      vp.type,
      vp.name as voucher_program_name
      from voucher_codes vc
      inner join voucher_programs vp on vc.voucher_program_id = vp.id
      inner join voucher_program_hotel vph on vph.voucher_program_id = vp.id
      inner join hotels h on vph.hotel_id = h.id
      where lower(vc.code) = lower($1) and h._id = $2
      group by vc.id, vc.code, vc.claimed_date,
        vp.type, vp.name, vc.date_allowed;`,
      [code, hotelUuid]
    );
    let voucherCode = null;
    if (result?.length > 0) {
      voucherCode = result[0];
    }
    if (!voucherCode) {
      return voucherCode;
    }

    if (voucherCode.type !== VoucherProgramType.PER_DIEM) {
      if (voucherCode.claimed_date != null) {
        voucherCode = null;
      }
    } else {
      voucherCode = this.validatePerdiemVoucher(voucherCode);
      if (voucherCode == null) {
        return voucherCode;
      }
    }
    voucherCode = await this.voucherCodeRepository.query(
      `
      select
      vc.id,
      vc.code,
      vc.claimed_date,
      vc.date_allowed,
      vp.name as voucher_program_name,
      vp.total_amount,
      vp.refund_amount,
      vp.payer,
      vp.payer_percentage,
      vc.amount_used,
      vp.type,
      vp.amount_type,
      coalesce(json_agg(json_build_object(
        'max_price', vpr.max_price,
        'quantity', vpr.quantity,
        'menu_category_ids', vpr.menu_category_ids,
        'meal_period_id', vpr.meal_period_id
      )) FILTER (WHERE vpr.id IS NOT NULL), '[]') as rules
      from voucher_codes vc
      inner join voucher_programs vp on vc.voucher_program_id = vp.id
      inner join voucher_program_hotel vph on vph.voucher_program_id = vp.id
      inner join hotels h on vph.hotel_id = h.id
      left join voucher_program_rules vpr on vp.id = vpr.voucher_program_id
      where lower(vc.code) = lower($1) and h._id = $2
      and vp.is_active = true
      group by vc.id, vc.code, vc.claimed_date,
        vp.total_amount, vp.refund_amount,
        vp.payer, vp.payer_percentage,
        vc.amount_used, vp.type, vp.amount_type, vp.name, vc.date_allowed;`,
      [code, hotelUuid]
    );

    return voucherCode;
  }

  validatePerdiemVoucher(voucherCode) {
    try {
      if (voucherCode.voucher_program_name?.includes("PMS-INTEGRATION")) {
        if (
          getDateWithoutTime(voucherCode.date_allowed).getTime() >=
          getDateWithoutTime(new Date().toISOString()).getTime()
        ) {
          return voucherCode;
        } else {
          return null;
        }
      }
      if (voucherCode.claimed_date != null) {
        const claimedDateUTC = toUTC(new Date(voucherCode.claimed_date));
        const nowUTC = toUTC(new Date(Date.now()));
        const diff = Math.abs(
          new Date(claimedDateUTC).getTime() - new Date(nowUTC).getTime()
        );
        const hours24 = 24 * 60 * 60 * 1000;
        if (diff > hours24) {
          return null;
        }
      }
      return voucherCode;
    } catch (error) {
      console.log("Failed at validatePerdiemVoucher", JSON.stringify(error));
    }
  }

  async getWithVoucherProgram(id: number) {
    let qb = this.connection
      .createQueryBuilder()
      .select(
        `
        vc.*,
        vc.amount_used,
        vp.name as voucher_program_name,
        vp.type as voucher_program_type,
        vp.payer_percentage,
        vp.total_amount
      `
      )
      .from("voucher_codes", "vc")
      .innerJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .where("vc.id = :vcId")
      .setParameter("vcId", id);
    return await qb.getRawOne();
  }

  async findById(ids: number[], isAvailable?: boolean) {
    return this.voucherCodeRepository.find({
      where: {
        id: In(ids),
        ...(isAvailable ? { claimedDate: null } : null),
      },
    });
  }

  async generate(dto: CreateVoucherCodeDTO) {
    if (dto.numberOfCodes > MAX_CODE_GENERATION_LIMIT) {
      throw new HttpException(
        `Max code generation limit ${MAX_CODE_GENERATION_LIMIT}`,
        HttpStatus.BAD_REQUEST
      );
    }
    const entity = await this.voucherProgramHotelRepository.findOne({
      where: {
        voucherProgramId: dto.voucherProgramId,
        hotelId: dto.hotelId,
      },
    });
    if (!entity) {
      throw new HttpException(
        "Hotel not associated with voucher program",
        HttpStatus.BAD_REQUEST
      );
    }
    const voucherProgram = await this.voucherProgramRepository.findOne({
      where: {
        id: dto.voucherProgramId,
      },
    });
    if (voucherProgram.type == VoucherProgramType.DISCOUNT) {
      throw new HttpException(
        `Can't generate codes for ${VoucherProgramType.DISCOUNT} voucher`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (!voucherProgram) {
      throw new HttpException(
        `Voucher program does not exist`,
        HttpStatus.BAD_REQUEST
      );
    }
    const codesMap = {};
    for (let i = 0; i < dto.numberOfCodes; i++) {
      codesMap[Math.random().toString(36).slice(7).toUpperCase()] = true;
    }
    const voucherCodes = Object.keys(codesMap).map((code) => {
      return {
        code,
        voucherProgramId: dto.voucherProgramId,
        roomNumber: dto.roomNumber ?? null,
        lastName: dto.lastName ?? null,
        hotelWebCode: dto.hotelWebCode ?? null,
        dateAllowed: dto.dateAllowed ?? null,
      };
    });
    return await this.voucherCodeRepository.save(voucherCodes);
  }

  async refundVoucherAmount(
    voucherCodeId: number,
    refundAmount: number,
    queryRunner: QueryRunner
  ) {
    this.logger.log(
      `@refundVoucherAmount : Refunding voucher amount: ${refundAmount} for voucher code id ${voucherCodeId}`
    );
    try {
      const voucherCode = await queryRunner.manager.findOne(VoucherCode, {
        where: { id: voucherCodeId },
      });

      if (!voucherCode) {
        throw new HttpException(
          `Voucher code with id ${voucherCodeId} not found`,
          HttpStatus.NOT_FOUND
        );
      }
      console.log("voucherCode", JSON.stringify(voucherCode));

      voucherCode.amountUsed =
        Number(voucherCode.amountUsed) - Number(refundAmount);
      await queryRunner.manager.save(voucherCode);
      return voucherCode;
    } catch (error) {
      throw new Error(`Failed to refund voucher amount: ${error.message}`);
    }
  }

  private async initiatedOrdersByVoucher(code: string) {
    return this.connection
      .createQueryBuilder()
      .select(
        `o.id as order_id,
        o.refund_amount as existing_refund_amount,
        o.applied_voucher_amount,
        o.voucher_code_id`
      )
      .from("voucher_codes", "vc")
      .leftJoin("orders", "o", "o.voucher_code_id = vc.id")
      .innerJoin("voucher_programs", "vp", "vp.id = vc.voucher_program_id")
      .where("vc.code = :code", { code })
      .andWhere("o.applied_voucher_amount > 0")
      .andWhere("CAST(vp.type AS text) = :type", {
        type: VoucherProgramType.PER_DIEM,
      })
      .andWhere("CAST(o.status AS text) = :status", {
        status: OrderStatusEnum.INITIATED,
      })
      .getRawMany();
  }
}
