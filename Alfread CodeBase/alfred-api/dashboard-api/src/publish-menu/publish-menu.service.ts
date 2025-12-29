import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { S3Service } from "../aws/s3.service";
import { getHotelMenuS3Name, getMenuS3Bucket } from "helpers";
import { HotelService } from "../hotel/hotel.service";
import { MenuService } from "../menu/menu.service";
import { DataSource, In, Repository } from "typeorm";
import { DetailedMenuVM } from "src/menu/vm/menu.vm";
import * as _ from "lodash";
import { HOTEL_REPOSITORY, PG_DATA_SOURCE } from "../../constants";
import { Hotel } from "database/entities/hotel.entity";

@Injectable()
export class PublishMenuService {
  logger = new Logger();
  @Inject(MenuService)
  private readonly menuService: MenuService;
  @Inject(HotelService)
  private readonly hotelService: HotelService;
  @Inject(S3Service)
  private readonly s3Service: S3Service;
  @Inject(HOTEL_REPOSITORY)
  private readonly hotelRepository: Repository<Hotel>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  async publishToS3(id: number, hotelId: number) {
    const menuItems = await this.menuService.getDetailedMenu(id, hotelId);
    const hotel = await this.hotelService.findOne({
      where: {
        id: hotelId,
      },
    });
    if (menuItems.length == 0) {
      throw new HttpException("Menu not found", HttpStatus.NOT_FOUND);
    }

    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i]) {
        menuItems[i].price = menuItems[i]?.new_price
          ? menuItems[i]?.new_price
          : menuItems[i]?.price;
      }
    }
    try {
      await this.s3Service.putObject({
        Bucket: getMenuS3Bucket(),
        Key: getHotelMenuS3Name(hotel._id),
        Body: JSON.stringify(new DetailedMenuVM(menuItems).build()),
        ContentType: "application/json",
        CacheControl: "no-cache, no-store, must-revalidate",
      });
    } catch (err) {
      this.logger.error(`PublishMenuService@publish: ${err.message}`);
      throw new HttpException("Failed to publish menu", HttpStatus.CONFLICT);
    }

    try {
      await this.hotelService.setPublishedMenu(hotelId, id);
    } catch (err) {
      this.logger.error(`PublishMenuService@setPublishedMenu: ${err.message}`);
      throw new HttpException(
        "Failed to save published menu",
        HttpStatus.CONFLICT
      );
    }
    return true;
  }

  async propagateMenuConfiguration(
    sourceHotelId: number,
    targetHotelIds: number[],
    merchantIds: number[]
  ) {
    try {
      const [sourceMenu, targetHotels] = await Promise.all([
        this.getSourceMenu(sourceHotelId),
        this.getValidTargetHotels(targetHotelIds),
      ]);

      const validTargetHotels = targetHotels.filter(
        (hotel) => hotel.id !== sourceHotelId
      );
      console.log(
        `Propagate Menu To Hotel called for ${JSON.stringify(
          sourceMenu
        )}, merchant Ids: ${JSON.stringify(
          merchantIds
        )} and target hotels: ${JSON.stringify(targetHotelIds)}`
      );
      const propagationResults = await Promise.all(
        validTargetHotels.map((targetHotel) =>
          this.propagateMenuToHotel(sourceMenu, merchantIds, targetHotel).catch(
            (error) => ({
              hotel: targetHotel.name,
              status: "FAILED",
              error: error.message,
            })
          )
        )
      );

      const successfulPropagations = propagationResults.filter(
        (result) => !("status" in result) || result.status !== "FAILED"
      );
      const failedPropagations = propagationResults.filter(
        (result) => "status" in result && result.status === "FAILED"
      );

      return {
        data: propagationResults,
        summary: {
          total: propagationResults.length,
          successful: successfulPropagations.length,
          failed: failedPropagations.length,
        },
      };
    } catch (error) {
      this.logger.error("Error in menu configuration propagation", error);
      throw new Error(`Menu propagation failed: ${error.message}`);
    }
  }

  private async getSourceMenu(sourceHotelId: number) {
    const sourceMenu = await this.hotelService.findMenu(sourceHotelId);
    if (!sourceMenu) {
      console.log(`Source menu not found for source ID ${sourceHotelId}`);
      throw new HttpException("Source menu not found", HttpStatus.NOT_FOUND);
    }
    return sourceMenu;
  }

  private async getValidTargetHotels(targetHotelIds: number[]) {
    const targetHotels = await this.hotelRepository.findBy({
      id: In(targetHotelIds),
    });
    if (targetHotels.length !== targetHotelIds.length) {
      console.log(`Invalid target hotels specified  with ${targetHotelIds}`);
      throw new HttpException(
        "Invalid target hotels specified",
        HttpStatus.BAD_REQUEST
      );
    }
    return targetHotels;
  }

  private async propagateMenuToHotel(
    sourceMenu: any,
    merchantIds: number[],
    targetHotel: any
  ) {
    const targetMenu = await this.ensureTargetMenuExists(targetHotel);

    const targetMerchants = await this.hotelService.findHotelMerchants(
      targetHotel.id
    );

    const targetMerchantIdValues = _.uniq(
      targetMerchants.map((merchant) => merchant.id)
    );

    const commonMerchantIds = _.intersection(
      merchantIds,
      targetMerchantIdValues
    );

    try {
      await this.menuService.synchronizeMenuContent(
        sourceMenu.id,
        targetMenu.id,
        commonMerchantIds
      );
      await this.regenerateMenu(targetMenu.id, targetHotel.id);

      return {
        hotel: targetHotel.name,
        status: "SUCCESS",
      };
    } catch (error) {
      this.logger.error(
        `Failed to propagate menu for hotel ${targetHotel.id}, hotelName ${targetHotel.name}: ${error.message}`
      );

      return {
        hotel: targetHotel.name,
        status: "FAILED",
        error: error.message,
      };
    }
  }

  private async ensureTargetMenuExists(targetHotel: any) {
    let targetMenu = await this.hotelService.findMenu(targetHotel.id);
    if (!targetMenu) {
      targetMenu = await this.menuService.create({
        name: `${targetHotel.name}-Replicated-Menu`,
        hotelIds: [targetHotel.id],
      });
      await this.hotelRepository.update(
        { id: targetHotel.id },
        { menuId: targetMenu.id }
      );
    }
    return targetMenu;
  }

  async regenerateMenu(id: number, hotelId: number) {
    try {
      await this.publishToS3(id, hotelId);
    } catch (err) {
      this.logger.error(`PublishMenuService@regenerateMenu: ${err.message}`);
    }
  }
}
