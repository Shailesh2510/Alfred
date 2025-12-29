import { Controller, Post, Param, UseGuards, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import { UserType } from "../../database/enums/usertype";
import { RestApiResponse } from "helpers";
import { PublishMenuService } from "./publish-menu.service";
import { ReplicateMenuConfigurationDTO } from "src/menu/dto/replicate-menu.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { REPLICATE_MENU_EVENT } from "../../events";

@ApiTags("Publish Menu (Tenant)")
@Controller("tenant/menu")
@ApiBearerAuth()
export class TenantPublishMenuController {
  constructor(
    private readonly publishMenuService: PublishMenuService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post(":id/publish/hotel/:hotel_id")
  @UseGuards(AuthGuard)
  async publish(
    @Param("id") id: string,
    @Param("hotel_id") hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const published = await this.publishMenuService.publishToS3(+id, +hotelId);
    return RestApiResponse({
      published,
    });
  }

  @Post(":source_hotel_id/propagate")
  @UseGuards(AuthGuard)
  async propagateMenuConfiguration(
    @Param("source_hotel_id") sourceHotelId: number,
    @Body() payload: ReplicateMenuConfigurationDTO
  ) {
    this.eventEmitter.emit(REPLICATE_MENU_EVENT, {
      sourceHotelId: sourceHotelId,
      targetHotelIds: payload.targetHotelIds,
      merchantIds: payload.merchantIds,
    });
    return RestApiResponse({
      message: "Menu propagation started",
      isPublishMenuTriggered: true,
    });
  }
}
