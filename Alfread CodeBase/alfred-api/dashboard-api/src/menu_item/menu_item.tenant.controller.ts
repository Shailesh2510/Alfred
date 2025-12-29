import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
  ParseArrayPipe,
  Patch,
} from "@nestjs/common";
import { MenuItemService } from "./menu_item.service";
import { BatchCreateMenuItemDTO } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDTO } from "./dto/update-menu-item.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import { UserType } from "../../database/enums/usertype";
import { RestApiResponse } from "helpers";
import { MenuItemVM } from "./vm/menu-item.vm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  MENU_ITEM_UPDATED_EVENT,
  MENU_ITEM_DELETED_EVENT,
  MENU_HOTEL_UPDATED_EVENT,
} from "../../events";
import { APIUpdateOrderPositionDTO } from "./dto/update-order-position.dto";
import { APIUpdateMenuItemOrderPositionDTO } from "./dto/update-menu-item-order-position.dto";

@ApiTags("Menu Item (Tenant)")
@Controller("tenant/menu_item")
@ApiBearerAuth()
export class TenantMenuItemController {
  constructor(
    private readonly menuItemService: MenuItemService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post("batch/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async createBatch(
    @Param("hotel_id") hotelId: string,
    @Body() payloadDTO: BatchCreateMenuItemDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuItems = await this.menuItemService.createBatch(
      +hotelId,
      payloadDTO
    );
    console.log({
      menuItems,
    });
    return RestApiResponse(new MenuItemVM(menuItems).build());
  }

  @Put(":id/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @Body() updateMenuDTO: UpdateMenuItemDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const menuItem = await this.menuItemService.update(
      {
        id: +id,
      },
      updateMenuDTO
    );
    this.eventEmitter.emit(MENU_ITEM_UPDATED_EVENT, menuItem.id);
    return RestApiResponse(new MenuItemVM(menuItem).build());
  }

  @Put("order_position/batch/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async updateOrderPosition(
    @Param("hotel_id") hotelId: string,
    @Body() dto: APIUpdateOrderPositionDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    console.log(`input-dto: `, dto);
    const data = await this.menuItemService.updateOrderPosition(dto, +hotelId);
    // this.eventEmitter.emit(MENU_HOTEL_UPDATED_EVENT, data.hotelMenus); //leave this commented bc we don't know yet
    return RestApiResponse(new MenuItemVM(data.menuItems).build());
  }

  @Patch("reorderItems")
  @UseGuards(AuthGuard)
  async updateMenuItemsOrderPosition(
    @Body() menuItems: APIUpdateMenuItemOrderPositionDTO[]
  ) {
    try {
      await this.menuItemService.reOrderMenuItems(menuItems);
      return true;
    } catch (error) {
      console.error("Error updating menu item order:", error);
      throw new Error(
        "Failed to update menu item order. Please try again later."
      );
    }
  }

  @Delete(":id/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async delete(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.menuItemService.delete({
      id: +id,
    });
    this.eventEmitter.emit(MENU_ITEM_DELETED_EVENT, +id);
    return RestApiResponse(data);
  }
}
