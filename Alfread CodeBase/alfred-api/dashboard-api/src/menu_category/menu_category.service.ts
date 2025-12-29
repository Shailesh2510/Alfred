import { Inject, Injectable, Logger } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import {
  MENU_CATEGORY_REPOSITORY,
  MENU_ITEM_REPOSITORY,
  PG_DATA_SOURCE,
} from "../../constants";
import { MenuCategory } from "database/entities/menu_category.entity";
import { MealPeriodService } from "src/meal_period/meal_period.service";
import { CreateMenuCategoryDTO } from "./dto/create-menu-category.dto";
import { UpdateMenuCategoryDTO } from "./dto/update-menu-category.dto";
import { MenuService } from "../menu/menu.service";
import { MealPeriodVM } from "../meal_period/vm/meal_period.vm";
import { BaseService } from "../base.service";
import { MenuItem } from "../../database/entities/menu_item.entity";

@Injectable()
export class MenuCategoryService extends BaseService<
  MenuCategory,
  CreateMenuCategoryDTO,
  UpdateMenuCategoryDTO
> {
  logger = new Logger();
  @Inject(MENU_CATEGORY_REPOSITORY)
  protected _repository: Repository<MenuCategory>;
  @Inject(MealPeriodService)
  private readonly mealPeriodService: MealPeriodService;
  @Inject(MenuService)
  private readonly menuService: MenuService;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(MENU_ITEM_REPOSITORY)
  private readonly menuItemRepository: Repository<MenuItem>;

  async create(createMenuCategoryDTO: CreateMenuCategoryDTO) {
    await this.mealPeriodService.findOne({
      where: {
        id: createMenuCategoryDTO.mealPeriodId,
      },
    });
    await this.menuService.findOneById(createMenuCategoryDTO.menuId);
    return await this._repository.save(createMenuCategoryDTO);
  }

  async reOrderMenuCategories(
    categories: { menuCategoryId: number; orderPosition: number }[]
  ) {
    try {
      const updatePromises = categories.map(
        ({ menuCategoryId, orderPosition }) => {
          return this._repository
            .createQueryBuilder()
            .update(MenuCategory)
            .set({ orderPosition })
            .where("id = :menuCategoryId", { menuCategoryId })
            .execute();
        }
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error during reordering menu categories:", error);
      throw new Error(
        "Failed to reorder menu categories. Please try again later."
      );
    }
  }

  async getAssociatedMealPeriod(menuCategoryId: number) {
    const data = await this.connection
      .createQueryBuilder()
      .select(`mp.*`)
      .from("menu_category", "mc")
      .innerJoin("meal_period", "mp", "mc.meal_period_id = mp.id")
      .where("mc.id = :menuCategoryId")
      .setParameter("menuCategoryId", menuCategoryId)
      .getRawOne();
    return new MealPeriodVM(data).build();
  }

  async deleteMenuItemsByMenuCategory(menuCategoryId: number) {
    try {
      await this.menuItemRepository.delete({
        menuCategoryId,
      });
      return true;
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@delete]: ${err.mesage}`);
      this.logger.error(err.stack);
    }
    return false;
  }
}
