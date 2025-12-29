import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Get,
  Delete,
  Patch,
} from "@nestjs/common";
import { MenuCategoryService } from "./menu_category.service";
import { CreateMenuCategoryDTO } from "./dto/create-menu-category.dto";
import { UpdateMenuCategoryDTO } from "./dto/update-menu-category.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import { UserType } from "../../database/enums/usertype";
import { RestApiResponse } from "helpers";
import { MenuCategoryVM } from "./vm/menu-category.vm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  MENU_CATEGORY_DELETED_EVENT,
  MENU_CATEGORY_UPDATED_EVENT,
} from "../../events";
import { HotelService } from "../hotel/hotel.service";
import { APIUpdateMenuCategoryOrderPositionDTO } from "./dto/update-menu-category-order-position.dto";

@ApiTags("Menu Category (Tenant)")
@Controller("tenant/menu_category")
@ApiBearerAuth()
export class TenantMenuCategoryController {
  constructor(
    private readonly menuCategoryService: MenuCategoryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly hotelService: HotelService
  ) {}

  @Get("menu/:menu_id")
  @UseGuards(AuthGuard)
  async list(
    @Param("menu_id") menuId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuCategories = await this.menuCategoryService.find({
      where: {
        menuId: +menuId,
      },
    });
    return RestApiResponse(menuCategories);
  }

  @Get("hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async listByHotel(
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const hotel = await this.hotelService.findOne({
      where: {
        id: +hotelId,
      },
    });
    const menuCategories = await this.menuCategoryService.find({
      where: {
        menuId: +hotel.menuId,
      },
    });
    return RestApiResponse(menuCategories);
  }

  @Post("hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async create(
    @Param("hotel_id") hotelId: string,
    @Body() createMenuCategoryDTO: CreateMenuCategoryDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuCategory = await this.menuCategoryService.create(
      createMenuCategoryDTO
    );
    return RestApiResponse(new MenuCategoryVM(menuCategory).build());
  }

  @Put(":id/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateMenuDTO: UpdateMenuCategoryDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuCategory = await this.menuCategoryService.update(
      {
        id: +id,
      },
      updateMenuDTO
    );
    this.eventEmitter.emit(MENU_CATEGORY_UPDATED_EVENT, menuCategory.id);
    return RestApiResponse(new MenuCategoryVM(menuCategory).build());
  }

  @Patch("reorder")
  @UseGuards(AuthGuard)
  async updateMenuCategoriesOrderPosition(
    @Body() categories: APIUpdateMenuCategoryOrderPositionDTO[]
  ) {
    try {
      await this.menuCategoryService.reOrderMenuCategories(categories);
      return true;
    } catch (error) {
      console.error("Error updating menu category order:", error);
      throw new Error(
        "Failed to update menu category order. Please try again later."
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(
    @Param("id") id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuCategory = await this.menuCategoryService.findOne({
      where: {
        id: +id,
      },
    });
    await this.menuCategoryService.deleteMenuItemsByMenuCategory(+id);
    await this.menuCategoryService.delete({
      id: +id,
    });
    this.eventEmitter.emit(MENU_CATEGORY_DELETED_EVENT, menuCategory.id);
    return RestApiResponse(true);
  }
}
