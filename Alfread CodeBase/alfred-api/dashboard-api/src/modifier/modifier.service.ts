import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  MODIFIER_REPOSITORY,
  MODIFIER_OPTION_REPOSITORY,
  PG_DATA_SOURCE,
  ITEM_MODIFIER_REPOSITORY,
} from "../../constants";
import { Modifier } from "../../database/entities/modifier.entity";
import { ModifierOption } from "../../database/entities/modifier_option.entity";
import { DataSource, In, Repository } from "typeorm";
import {
  CreateModifierDTO,
  CreateModifierOptionDTO,
} from "./dto/create-modifier.dto";
import { UpdateModifierDTO } from "./dto/update-modifier.dto";
import { ModifierVM } from "./vm/modifier.vm";
import { ItemModifier } from "../../database/entities/item.entity";
import { BaseService } from "src/base.service";

@Injectable()
export class ModifierService extends BaseService<
  Modifier,
  CreateModifierDTO,
  UpdateModifierDTO
> {
  logger = new Logger();
  @Inject(MODIFIER_REPOSITORY)
  protected _repository: Repository<Modifier>;
  @Inject(MODIFIER_OPTION_REPOSITORY)
  private readonly modifierOptionRepository: Repository<ModifierOption>;
  @Inject(ITEM_MODIFIER_REPOSITORY)
  private readonly itemModifierRepository: Repository<ItemModifier>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  async _create(createModifierDTO: CreateModifierDTO, merchantId: number) {
    const modifierEntity = await this.create({
      ...createModifierDTO,
      merchantId,
    });
    let modifierOptionsEntities = [];
    try {
      modifierOptionsEntities = await this.modifierOptionRepository.save(
        this.getModifierOptions(
          merchantId,
          modifierEntity.id,
          createModifierDTO.options
        )
      );
    } catch (err) {
      await this.delete({
        id: modifierEntity.id,
      });
      this.logger.log(`ModifierService@create: ${err.message}`);
      throw new HttpException(
        "Could not create modifier",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    return [modifierEntity, modifierOptionsEntities];
  }

  private getModifierOptions(
    merchantId: number,
    modifierId: number,
    options: CreateModifierOptionDTO[]
  ) {
    let holder = [];
    if (!!options) {
      options.forEach((option) => {
        holder.push({
          merchantId,
          modifierId,
          name: option.name,
          price: option.price,
        });
      });
    }
    return holder;
  }

  private getQueryBuilder(merchantId: number) {
    return (
      this.connection
        .createQueryBuilder()
        .select(
          `
        m.*,
        json_agg(distinct jsonb_build_object(
          'id', mo.id,
          'name', mo.name,
          'price', mo.price
        )) as options
      `
        )
        .from("modifiers", "m")
        // .withDeleted() //left this until we will have restore functionality
        .leftJoin(
          "modifier_options",
          "mo",
          "mo.modifier_id = m.id and mo.merchant_id = :merchantId and mo.deleted_at is null"
        )
        .where("m.merchant_id = :merchantId")
        .setParameter("merchantId", merchantId)
    );
  }

  async findAll(merchantId: number) {
    return await this.getQueryBuilder(merchantId)
      .groupBy(
        "m.id, m.version, m.merchant_id, m.name, m.required_options, m.multiple_options, m.created_at, m.updated_at, m.deleted_at, m.free_modifier_count"
      )
      .getRawMany();
  }

  async _findOne(id: number, merchantId: number) {
    const entity = await this.getQueryBuilder(merchantId)
      .andWhere(`m.id = :modifierId`)
      .setParameter("modifierId", id)
      .groupBy("m.id")
      .getRawOne();

    if (!entity) {
      throw new HttpException(`Category does not exist`, HttpStatus.NOT_FOUND);
    }

    return entity;
  }

  async findById(ids: number[]) {
    return await this.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findByIdWithOptions(ids: number[]) {
    const modifiers = await this.findById(ids);
    const modifierOptions = await this.modifierOptionRepository.find({
      where: {
        modifierId: In(ids),
      },
    });
    const modifierOptionsMap = {};
    modifierOptions.forEach((modifierOption) => {
      if (modifierOptionsMap[modifierOption.modifierId]) {
        modifierOptionsMap[modifierOption.modifierId].push(modifierOption);
      } else {
        modifierOptionsMap[modifierOption.modifierId] = [modifierOption];
      }
    });
    const modifierVMs = new ModifierVM(modifiers).build();
    modifierVMs.forEach((modifierVM) => {
      modifierVM.options = modifierOptionsMap[modifierVM.id];
    });
    return modifierVMs;
  }

  async _update(
    id: number,
    updateModifierDTO: UpdateModifierDTO,
    merchantId: number
  ) {
    const modifierOptions = this.getModifierOptions(
      merchantId,
      id,
      updateModifierDTO.options
    );
    await this.modifierOptionRepository.softDelete({
      modifierId: id,
      merchantId,
    });
    await this.modifierOptionRepository.save(modifierOptions);
    delete updateModifierDTO.options; //no need to have inside update
    return await this.update(
      {
        id,
        merchantId,
      },
      {
        ...updateModifierDTO,
      }
    );
  }

  async remove(id: number, merchantId: number) {
    await this.findOne({ where: { id, merchantId } });
    const data = await this.itemModifierRepository.find({
      where: {
        modifierId: id,
        merchantId,
      },
    });
    if (data && data.length) {
      throw new HttpException(
        `Cannot delete modifiers that have items`,
        HttpStatus.CONFLICT
      );
    }
    return await this.softDelete({ id });
  }
}
