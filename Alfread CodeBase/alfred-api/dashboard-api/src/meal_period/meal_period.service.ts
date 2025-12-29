import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY, MEAL_PERIOD_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource, In, Repository } from 'typeorm';
import { CreateMealPeriodDTO, UpdateMealPeriodDTO } from './dto/create-meal-period.dto';
import { MealPeriod } from '../../database/entities/meal_period.entity';
import { Category } from 'database/entities/category.entity';
import { getUncategorizedCategoryName } from 'helpers';
import { BaseService } from 'src/base.service';

@Injectable()
export class MealPeriodService extends BaseService<MealPeriod, CreateMealPeriodDTO, UpdateMealPeriodDTO> {
  @Inject(MEAL_PERIOD_REPOSITORY)
  protected _repository: Repository<MealPeriod>;
  @Inject(CATEGORY_REPOSITORY)
  private categoryRepository: Repository<Category>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  async createCategoryForMealPeriod(mealPeriodId: number, merchantId: number) {
    return await this.categoryRepository.save({
      mealPeriodId,
      merchantId,
      name: getUncategorizedCategoryName()
    })
  }

  async create(createMealPeriodDTO: CreateMealPeriodDTO) {
    const mealPeriodEntity = await this._repository.save(createMealPeriodDTO);
    await this.createCategoryForMealPeriod(mealPeriodEntity.id, mealPeriodEntity.merchantId);
    return await this.findOne({where: {
      id: mealPeriodEntity.id
    }})
  }

  async findAll(merchantIds?: number[]) {
    if (merchantIds) {
      return await this.find({
        where: {
          merchantId: In(merchantIds)
        }
      });
    }
    return await this.find();
  }

  async findByIds(ids: number[]) {
    const data = await this.find({
      where: {
        id: In(ids)
      }
    });
    if (data.length != ids.length) {
      throw new HttpException(`Meal period does not exist`, HttpStatus.NOT_FOUND)
    }
    return data;
  }

  async findHotelMerchants(hotelId: number) {
    return await this.connection.createQueryBuilder()
      .select('m.*, mh.meal_period_id')
      .from('merchants', 'm')
      .innerJoin('merchant_hotel', 'mh', 'mh.merchant_id = m.id')
      .where('mh.hotel_id = :hotelId')
      .setParameter('hotelId', hotelId)
      .getRawMany()
  }
}
