import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { RestApiResponse } from "helpers";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/api-key.guard";
import { MenuService } from "./menu.service";
import { FetchMenuDTO } from "./dto/fetch-menu.dto";
import { isBefore, startOfDay } from "date-fns";

@ApiTags("Menu (Public)")
@Controller("gateway/menu")
@ApiBearerAuth()
export class PublicMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post("/:hotelId/:merchantId")
  @UseGuards(ApiKeyGuard)
  async fetchMenuDetails(
    @Body() fetchMenuPayload: FetchMenuDTO,
    @Param("hotelId") hotelId: string,
    @Param("merchantId") merchantId: string
  ) {
    if (!hotelId) {
      throw new HttpException("Invalid hotel Id", HttpStatus.BAD_REQUEST);
    } else if (!merchantId) {
      throw new HttpException("Invalid merchant Id", HttpStatus.BAD_REQUEST);
    } else if (
      isBefore(fetchMenuPayload?.scheduledDate, startOfDay(new Date()))
    ) {
      throw new HttpException("Invalid date", HttpStatus.BAD_REQUEST);
    }
    try {
      const fetchMenuDetails =
        await this.menuService.fetchMenuDetailsByMerchantId(
          +hotelId,
          +merchantId,
          fetchMenuPayload
        );
      return RestApiResponse(fetchMenuDetails);
    } catch (err) {
      console.log(`error:publicOrderService.fetchMenu ${err}`);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
