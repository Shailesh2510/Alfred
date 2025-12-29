import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { In, Repository } from "typeorm";
import {
  MEAL_PERIOD_REPOSITORY,
  MENU_HOTEL_REPOSITORY,
  MENU_ITEM_REPOSITORY,
} from "../../constants";
import { MenuItem } from "../../database/entities/menu_item.entity";
import {
  BatchCreateMenuItemDTO,
  CreateMenuItemDTO,
} from "./dto/create-menu-item.dto";
import { UpdateMenuItemDTO } from "./dto/update-menu-item.dto";
import { ItemService } from "../item/item.service";
import { MenuService } from "../menu/menu.service";
import { MenuCategoryService } from "../menu_category/menu_category.service";
import { MERCHANT_HOTEL_REPOSITORY } from "../../constants";
import { MerchantHotel } from "../../database/entities/merchant.entity";
import { MealPeriod } from "../../database/entities/meal_period.entity";
import { BaseService } from "src/base.service";
import { APIUpdateOrderPositionDTO } from "./dto/update-order-position.dto";
import { MenuHotel } from "../../database/entities/menu_hotel.entity";

@Injectable()
export class MenuItemService extends BaseService<
  MenuItem,
  CreateMenuItemDTO,
  UpdateMenuItemDTO
> {
  logger = new Logger();
  @Inject(MENU_ITEM_REPOSITORY)
  protected _repository: Repository<MenuItem>;
  @Inject(ItemService)
  private readonly itemService: ItemService;
  @Inject(MenuService)
  private readonly menuService: MenuService;
  @Inject(MenuCategoryService)
  private readonly menuCategoryService: MenuCategoryService;
  @Inject(MERCHANT_HOTEL_REPOSITORY)
  private readonly merchantHotelRepository: Repository<MerchantHotel>;
  @Inject(MEAL_PERIOD_REPOSITORY)
  private readonly mealPeriodRepository: Repository<MealPeriod>;

  async createBatch(hotelId: number, payloadDTO: BatchCreateMenuItemDTO) {
    const menuCategoryEntity = await this.menuCategoryService.findOne({
      where: {
        id: payloadDTO.menuCategoryId,
      },
    });
    const mealPeriodEntity = await this.mealPeriodRepository.findOne({
      where: {
        id: menuCategoryEntity.mealPeriodId,
      },
    });
    if (!mealPeriodEntity) {
      throw new HttpException(`Meal period not found`, HttpStatus.NOT_FOUND);
    }
    const merchantHotelEntity = await this.merchantHotelRepository.findOne({
      where: {
        hotelId,
        merchantId: mealPeriodEntity.merchantId,
      },
    });
    if (!merchantHotelEntity) {
      throw new HttpException(
        `Hotel is not linked to this merchant`,
        HttpStatus.CONFLICT
      );
    }
    const items = await this.itemService.findById(
      payloadDTO.itemIds,
      mealPeriodEntity.merchantId
    );

    if (items.length == 0) {
      throw new HttpException(
        `Items associated with merchant not found`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (items.length !== payloadDTO.itemIds.length) {
      throw new HttpException(
        `Items not found for associated meal period`,
        HttpStatus.BAD_REQUEST
      );
    }

    const existingMenuItems = await this._repository.find({
      where: {
        menuId: payloadDTO.menuId,
        menuCategoryId: payloadDTO.menuCategoryId,
        // itemId: In(payloadDTO.itemIds),
      },
      order: {
        orderPosition: "DESC",
      },
    });
    if (existingMenuItems.length) {
      const itemsIdsMap = {};
      payloadDTO.itemIds.forEach((itemId) => (itemsIdsMap[itemId] = itemId));
      existingMenuItems.forEach((menuItem) => {
        if (itemsIdsMap[menuItem.itemId]) {
          delete itemsIdsMap[menuItem.itemId];
        }
      });
      payloadDTO.itemIds = Object.keys(itemsIdsMap).map((id) => +id);

      if (payloadDTO.itemIds.length == 0) {
        return existingMenuItems;
      }
    }

    const itemsMap = {};
    items.forEach((item) => {
      itemsMap[item.id] = {
        item,
        merchantId: mealPeriodEntity.merchantId,
      };
    });
    await this.menuService.findOneById(payloadDTO.menuId);
    await this.menuCategoryService.findOne({
      where: {
        id: payloadDTO.menuCategoryId,
      },
    });
    const dbData = [];
    let greatestOrderPosition = existingMenuItems?.length
      ? existingMenuItems[0].orderPosition ?? 0
      : 0;
    payloadDTO.itemIds.forEach((itemId, idx) => {
      dbData.push({
        itemId,
        menuCategoryId: payloadDTO.menuCategoryId,
        menuId: payloadDTO.menuId,
        price: itemsMap[itemId].item.price,
        orderPosition: ++greatestOrderPosition,
        merchantId: itemsMap[itemId].merchantId,
      });
    });
    return await this._repository.save(dbData);
  }

  reorderMenuItems(menuItems, { orderPosition, menuItemId }) {
    // Find the index of the menu item with the given menuItemId
    const menuItemIndex = menuItems.findIndex(
      (item) => item.itemId === menuItemId
    );

    if (menuItemIndex !== -1) {
      // Remove the menu item from the array
      const [movedMenuItem] = menuItems.splice(menuItemIndex, 1);

      // Insert the menu item at the specified order position
      menuItems.splice(orderPosition, 0, movedMenuItem);
    }

    return menuItems;
  }

  async updateOrderPosition(dto: APIUpdateOrderPositionDTO, hotelId: number) {
    let menuItems = await this._repository.find({
      where: {
        menuCategoryId: dto.menuCategoryId,
      },
      order: {
        orderPosition: "ASC",
      },
    });
    let updatePromises = [];
    let distanceToTravel = 0;
    let isNewPositionGreater = false;
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].orderPosition = i;
      updatePromises.push(
        this.update(
          {
            id: menuItems[i].id,
          },
          {
            orderPosition: i,
          }
        )
      );
      if (menuItems[i].id == dto.menuItemId) {
        if (dto.orderPosition > menuItems[i].orderPosition) {
          isNewPositionGreater = true;
          distanceToTravel = dto.orderPosition - menuItems[i].orderPosition;
          if (distanceToTravel == 1) {
            distanceToTravel = 2;
          }
        } else {
          distanceToTravel = menuItems[i].orderPosition - dto.orderPosition;
        }
      }
    }

    await Promise.all(updatePromises);
    updatePromises = [];

    console.log(`isNewPositionGreater: `, isNewPositionGreater);
    console.log(`distanceToTravel: `, distanceToTravel);

    if (isNewPositionGreater) {
      let decrement = 1;
      for (let i = 0; i <= distanceToTravel; i++) {
        if (menuItems[i].id == dto.menuItemId) {
          continue;
        }
        let newPosition = menuItems[i].orderPosition - decrement;
        if (newPosition == dto.orderPosition) {
          decrement++;
          newPosition--;
        }
        updatePromises.push(
          this.update(
            {
              id: menuItems[i].id,
            },
            {
              orderPosition: newPosition,
            }
          )
        );
      }
    } else {
      let increment = 1;
      for (let i = dto.orderPosition; i < menuItems.length; i++) {
        if (menuItems[i].id == dto.menuItemId) {
          continue;
        }
        let newPosition = menuItems[i].orderPosition + increment;
        if (newPosition == dto.orderPosition) {
          increment++;
          newPosition++;
        }
        updatePromises.push(
          this.update(
            {
              id: menuItems[i].id,
            },
            {
              orderPosition: newPosition,
            }
          )
        );
      }
    }

    updatePromises.push(
      this.update(
        {
          id: dto.menuItemId,
        },
        {
          orderPosition: dto.orderPosition,
        }
      )
    );

    // const reorderedMenuItems = this.reorderMenuItems(menuItems, {
    //   orderPosition: dto.orderPosition,
    //   menuItemId: dto.menuItemId,
    // });

    // for (let i = 0; i < reorderedMenuItems.length; i++) {
    //   updatePromises.push(this.update({
    //     id: reorderedMenuItems[i].id,
    //   }, {
    //     orderPosition: reorderedMenuItems[i].orderPosition
    //   }))
    // }
    // console.log(`menu: `, menuItems)

    await Promise.all(updatePromises);

    return {
      menuItems,
    };
  }

  async reOrderMenuItems(
    menuItems: { menuItemId: number; orderPosition: number }[]
  ) {
    try {
      const updatePromises = menuItems.map(({ menuItemId, orderPosition }) => {
        return this._repository
          .createQueryBuilder()
          .update(MenuItem)
          .set({ orderPosition })
          .where("id = :menuItemId", { menuItemId })
          .execute();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error during reordering menu items:", error);
      throw new Error("Failed to reorder menu items. Please try again later.");
    }
  }
}
