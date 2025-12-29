import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  PG_DATA_SOURCE,
  VOUCHER_PROGRAM_HOTEL_REPOSITORY,
  VOUCHER_PROGRAM_REPOSITORY,
  VOUCHER_PROGRAM_RULE_REPOSITORY,
} from "../../constants";
import { DataSource, DeepPartial, FindOptionsWhere, In, Repository } from "typeorm";
import { getPaginationData } from "pagination";
import {
  CreateVoucherProgramDTO,
  VoucherProgramRuleDTO,
} from "./dto/create-voucher-program.dto";
import {
  VoucherProgram,
  VoucherProgramPayer,
  VoucherProgramType,
} from "../../database/entities/voucher_program.entity";
import { VoucherProgramHotel } from "../../database/entities/voucher_program_hotel.entity";
import { UpdateVoucherProgramDTO } from "./dto/update-voucher-program.dto";
import { VoucherProgramRule } from "../../database/entities/voucher_program_rule.entity";
import { MealPeriodService } from "../meal_period/meal_period.service";
import { BaseService } from "../base.service";
import { HotelService } from "../hotel/hotel.service";
import { MenuCategoryService } from "../menu_category/menu_category.service";
import { VoucherProgramListQueryParams } from "./dto/voucher-program.dto";
import { VoucherCodeService } from "src/voucher_code/voucher_code.service";

@Injectable()
export class VoucherProgramService extends BaseService<
  VoucherProgram,
  CreateVoucherProgramDTO,
  UpdateVoucherProgramDTO
> {
  logger = new Logger();
  @Inject(VOUCHER_PROGRAM_REPOSITORY)
  protected _repository: Repository<VoucherProgram>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(VOUCHER_PROGRAM_HOTEL_REPOSITORY)
  private readonly voucherProgramHotelRepository: Repository<VoucherProgramHotel>;
  @Inject(VOUCHER_PROGRAM_RULE_REPOSITORY)
  private readonly voucherProgramRuleRepository: Repository<VoucherProgramRule>;
  @Inject(MealPeriodService)
  private readonly mealPeriodService: MealPeriodService;
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(MenuCategoryService)
  private readonly menuCategoryService: MenuCategoryService;
  @Inject(VoucherCodeService)
  private readonly voucherCodeService: VoucherCodeService;

  private getQueryBuilder(filters: {
    hotelId?: number;
    type?: VoucherProgramType;
    name?: string;
    isActive?: boolean;
  }) {
    let qb = this.connection
      .createQueryBuilder()
      .select(
        `
        vp.*,
        json_agg(
          json_build_object(
            'id', h.id,
            'name', h.name
          )
        ) as hotels
      `
      )
      .from("voucher_programs", "vp")
      .innerJoin(
        "voucher_program_hotel",
        "vph",
        "vph.voucher_program_id = vp.id"
      )
      .innerJoin("hotels", "h", "h.id = vph.hotel_id");

    if (filters.hotelId) {
      qb = qb
        .andWhere("vph.hotel_id = :hotelId")
        .setParameter("hotelId", filters.hotelId);
    }
    if (filters.type) {
      qb = qb.andWhere("vp.type = :type").setParameter("type", filters.type);
    }
    if (filters.isActive) {
      qb = qb
        .andWhere("vp.is_active = :isActive")
        .setParameter("isActive", filters.isActive);
    }
    if (filters?.name) {
      qb = qb
        .andWhere("lower(vp.name) like :name")
        .setParameter("name", `${filters.name.toLowerCase()}%`);
    }

    qb = qb.groupBy("vp.id").orderBy("vp.created_at", "DESC");
    return qb;
  }

  private async constructProgramRules(
    voucherProgram: VoucherProgram,
    rules: VoucherProgramRuleDTO[]
  ) {
    if (voucherProgram.type !== VoucherProgramType.PRE_FIXE) {
      return [];
    }
    const voucherProgramId = voucherProgram.id;
    const mealPeriodIdsMap = {};
    const menuCategoryIdsMap = {};
    const data =
      rules && rules.length
        ? rules.map((rule: VoucherProgramRuleDTO) => {
            mealPeriodIdsMap[rule.mealPeriodId] = rule.mealPeriodId;
            rule.menuCategoryIds.forEach((menuCategoryId: number) => {
              menuCategoryIdsMap[menuCategoryId] = menuCategoryId;
            });
            return {
              voucherProgramId,
              ...rule,
            };
          })
        : [];

    if (
      Object.keys(mealPeriodIdsMap).length > 1 ||
      Object.keys(mealPeriodIdsMap).length < 1
    ) {
      throw new HttpException(
        `Only one meal period is allowed for ${VoucherProgramType.PRE_FIXE} voucher`,
        HttpStatus.BAD_REQUEST
      );
    }

    const mealPeriodId = Number(Object.keys(mealPeriodIdsMap)[0]);
    await this.mealPeriodService.findOne({ where: { id: mealPeriodId } });
    await this.validateMenuCategoryIds(
      Object.keys(menuCategoryIdsMap).map((e) => Number(e)),
      mealPeriodId
    );

    return data;
  }

  private async validateMenuCategoryIds(
    menuCategoryIds: number[],
    mealPeriodId: number
  ) {
    const menuCategories = await this.menuCategoryService.find({
      where: {
        id: In(menuCategoryIds),
        mealPeriodId: mealPeriodId,
        // menuId: menuId // this would be better to have for validation
      },
    });

    if (menuCategories.length == 0) {
      throw new HttpException(
        `Menu categories not found`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (menuCategories.length != menuCategoryIds.length) {
      throw new HttpException(
        `Menu category does not exist`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async create(data: CreateVoucherProgramDTO) {
    if (
      data.payer == VoucherProgramPayer.ALFRED_RECOVERY ||
      data.payer == VoucherProgramPayer.ALFRED_PROGRAM
    ) {
      data.payerPercentage = 100;
    }
    if (data.type == VoucherProgramType.DISCOUNT) {
      if (!data.discountCode) {
        throw new HttpException(
          `Discount code required for ${VoucherProgramType.DISCOUNT} voucher`,
          HttpStatus.BAD_REQUEST
        );
      }
    }
    let hotels: any[] = [];
    if (data.hotelWebCode) {
      const hotel = await this.hotelService.findOne({
        where: { webCode: data.hotelWebCode },
      });
      hotels = [hotel];
    } else {
      hotels = await this.hotelService.find({
        where: { id: In(data.hotelIds) },
      });

      if (hotels.length !== data.hotelIds.length) {
        throw new HttpException(
          "One or more hotel IDs are invalid",
          HttpStatus.BAD_REQUEST
        );
      }
    }
    if (data.type === VoucherProgramType.PRE_FIXE) {
      if (!data.rules || data.rules.length == 0) {
        throw new HttpException(
          `Rules should apply for ${VoucherProgramType.PRE_FIXE} vouchers`,
          HttpStatus.BAD_REQUEST
        );
      }
      for (const hotel of hotels) {
        const menu = await this.hotelService.findMenu(hotel.id);
        if (!menu) {
          throw new HttpException(
            `PRE_FIXE voucher cannot be created for hotel ${hotel.id} as no menu is associated`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }
    const { hotelIds, ...voucherProgramData } = data;
    const voucherProgram = await this._repository.save(voucherProgramData);

    const voucherProgramRules = await this.constructProgramRules(
      voucherProgram,
      data.rules
    );
    if (voucherProgramRules.length) {
      await this.voucherProgramRuleRepository.save(voucherProgramRules);
    }

    const hotelAssociations = hotels.map((hotel) => ({
      hotelId: hotel.id,
      voucherProgramId: voucherProgram.id,
    }));

    await this.voucherProgramHotelRepository.save(hotelAssociations);

    if (data.discountCode && data.type == VoucherProgramType.DISCOUNT) {
      try {
        await this.voucherCodeService.create({
          voucherProgramId: voucherProgram.id,
          code: data.discountCode,
        });
      } catch (err) {
        console.log("error saving code: ", err);
        await this.voucherProgramHotelRepository.delete({
          voucherProgramId: voucherProgram.id,
        });
        await this._repository.delete({
          id: voucherProgram.id,
        });
        return null;
      }
    }

    return voucherProgram;
  }

  async _update(
    where: FindOptionsWhere<VoucherProgram>,
    data: UpdateVoucherProgramDTO & { hotelIds?: number[] }
  ) {
    const voucherProgram = await this.findOne({
      where,
    });
  
    if (!voucherProgram) {
      throw new HttpException(
        'Voucher program not found',
        HttpStatus.NOT_FOUND
      );
    }
      const voucherProgramId = voucherProgram.id;
      let voucherProgramRules = [];
    if (data.rules) {
      voucherProgramRules = await this.constructProgramRules(
        voucherProgram,
        data.rules
      );
    }
    
    if (data.hotelIds && data.hotelIds.length > 0) {
      const hotels = await this.hotelService.find({
        where: { id: In(data.hotelIds) },
      });
  
      if (hotels.length !== data.hotelIds.length) {
        throw new HttpException(
          "One or more hotel IDs are invalid",
          HttpStatus.BAD_REQUEST
        );
      }
  
      const existingAssociations = await this.voucherProgramHotelRepository.find({
        where: { voucherProgramId },
      });
  
      const existingHotelIds = existingAssociations.map(assoc => assoc.hotelId);
            const hotelsToAdd = data.hotelIds.filter(
        id => !existingHotelIds.includes(id)
      );
      const hotelsToRemove = existingHotelIds.filter(
        id => !data.hotelIds.includes(id)
      );
  
      if (hotelsToAdd.length > 0) {
        const newAssociations: DeepPartial<VoucherProgramHotel>[] = hotelsToAdd.map(hotelId => ({
          hotelId,
          voucherProgramId,
        }));
        await this.voucherProgramHotelRepository.save(newAssociations);
      }
  
      if (hotelsToRemove.length > 0) {
        await this.voucherProgramHotelRepository.delete({
          voucherProgramId,
          hotelId: In(hotelsToRemove),
        });
      }
    }
    const { hotelIds, rules, ...updateData } = data;
    await this.update({ id: voucherProgramId }, updateData);
      if (voucherProgramRules.length) {
      await this.voucherProgramRuleRepository.delete({
        voucherProgramId,
      });
      await this.voucherProgramRuleRepository.save(voucherProgramRules);
    }
  
    return await this.findOneFromHotel(voucherProgramId);
  }

  async findAllPagination(
    hotelId: number,
    query: VoucherProgramListQueryParams
  ) {
    const { take, skip } = getPaginationData(query.page);
    const qb = this.getQueryBuilder({
      hotelId,
      ...(query.hotelId ? { hotelId: query.hotelId } : null),
      ...query,
    });
    const [data, total] = await Promise.all([
      qb.limit(take).offset(skip).getRawMany(),
      qb.getCount(),
    ]);
    return {
      data,
      total,
      take,
    };
  }

  async findAll(hotelId: number) {
    return await this.getQueryBuilder({ hotelId }).getRawMany();
  }

  async findOneFromHotel(id: number, hotelId?: number) {
    let qb = this.getQueryBuilder({});

    qb = qb.andWhere("vp.id = :id").setParameter("id", id);

    if (hotelId) {
      qb = qb
        .andWhere("vph.hotel_id = :hotelId")
        .setParameter("hotelId", hotelId);
    }

    return await qb.getRawOne();
  }

  async getVoucherProgramRules(id: number, hotelId: number) {
    let qb = this.connection
      .createQueryBuilder()
      .select(`vpr.*`)
      .from("voucher_programs", "vp")
      .innerJoin(
        "voucher_program_rules",
        "vpr",
        "vpr.voucher_program_id = vp.id"
      )
      .andWhere("vp.id = :id")
      .setParameter("id", id);
    if (hotelId) {
      qb = qb
        .innerJoin(
          "voucher_program_hotel",
          "vph",
          "vph.voucher_program_id = vp.id"
        )
        .andWhere("vph.hotel_id = :hotelId")
        .setParameter("hotelId", hotelId);
    }
    return await qb.getRawMany();
  }
}
