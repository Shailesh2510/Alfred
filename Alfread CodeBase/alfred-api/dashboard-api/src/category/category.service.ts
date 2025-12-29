import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../constants';
import { Category } from '../../database/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { MealPeriodService } from 'src/meal_period/meal_period.service';
import { BaseService } from '../base.service';

@Injectable()
export class CategoryService extends BaseService<Category, {}, {}> {
  @Inject(CATEGORY_REPOSITORY)
  protected _repository: Repository<Category>;
  @Inject(MealPeriodService)
  private readonly mealPeriodService: MealPeriodService;

  async _create(createCategoryDTO: CreateCategoryDTO, merchantId: number) {
    const mealPeriod = await this.mealPeriodService.findOne({where: {
      id: createCategoryDTO.mealPeriodId
    }})
    if (!mealPeriod) {
      throw new HttpException(`Meal period does not exist`, HttpStatus.BAD_REQUEST)
    }
    return await this.create({
      ...createCategoryDTO,
      merchantId
    })
  }

  async _update(id: number, updateCategoryDTO: UpdateCategoryDTO, merchantId: number) {
    await this.findOne({where: { id, merchantId }})
    await this._repository.update(
      {
        id,
        merchantId
      }, {
        ...updateCategoryDTO
      })
    return await this.findOne({where: { id, merchantId }})
  }
}
