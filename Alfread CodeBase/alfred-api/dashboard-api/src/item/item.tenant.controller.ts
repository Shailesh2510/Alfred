import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ItemService } from "./item.service";
import {
  APIAssignItemsToMealPeriodDTO,
  APICreateItemDTO,
} from "./dto/create-item.dto";
import { UpdateItemDTO } from "./dto/update-item.dto";
import { AuthUser } from "src/auth/user.decorator";
import { InjectableUser } from "../../database/entities/user.entity";
import {
  RestApiResponse,
  getImageS3Name,
  getImageUrl,
  getMenuS3Bucket,
} from "helpers";
import {
  CategorizedItemVM,
  DetailedItemVM,
  ItemVM,
  SimpleListItemVM,
} from "./vm/item.vm";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserType } from "../../database/enums/usertype";
import { AuthGuard } from "../auth/auth.guard";
import { S3Service } from "../aws/s3.service";
import { MealPeriodService } from "../meal_period/meal_period.service";
import { PresignUrlDTO } from "./dto/presign-url.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ITEM_UPDATED_EVENT, ITEM_DELETED_EVENT } from "../../events";

@ApiTags("Item (Tenant)")
@Controller("tenant/item")
@ApiBearerAuth()
export class TenantItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly s3Service: S3Service,
    private readonly mealPeriodService: MealPeriodService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post("merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async create(
    @Param("merchant_id") merchantId: string,
    @Body() createItemDTO: APICreateItemDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.create(createItemDTO, +merchantId);
    return RestApiResponse(new ItemVM(item).build());
  }

  @Post("assign/meal_period/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async batchAssignToMealPeriod(
    @Param("merchant_id") merchantId: string,
    @Body() payloadDTO: APIAssignItemsToMealPeriodDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const completed = await this.itemService.batchAssignToMealPeriod(
      +merchantId,
      payloadDTO.mealPeriodId,
      payloadDTO.itemIds
    );
    return RestApiResponse({
      completed,
    });
  }

  @Get("merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async findAll(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const items = await this.itemService.findAll(+merchantId);
    const itemsMap = {};
    items.forEach((item) => {
      itemsMap[item.id] = item;
    });
    return RestApiResponse(
      new SimpleListItemVM(Object.values(itemsMap)).build()
    );
  }

  @Get("list/categorized/merchant/:merchant_id/menu/:menu_id")
  @UseGuards(AuthGuard)
  async categorized(
    @Param("merchant_id") merchantId: string,
    @Param("menu_id") menuId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const items = await this.itemService.findAllWithMenuItem(
      +merchantId,
      +menuId
    );
    const mealPeriods = await this.mealPeriodService.findAll([+merchantId]);
    const categorizedItems = {};
    const itemsArr: DetailedItemVM[] = [];
    items?.forEach((item) => {
      const itemVM = new ItemVM(item).build();
      itemVM.mealPeriods?.forEach((mealPeriod) => {
        itemsArr.push({
          ...itemVM,
          mealPeriodId: mealPeriod.id,
          mealPeriodName: mealPeriod.name,
          orderPosition: item.order_position,
          newPrice: item.new_price,
        });
      });
    });
    itemsArr.forEach((itemVM) => {
      if (categorizedItems[itemVM.mealPeriodId]) {
        categorizedItems[itemVM.mealPeriodId].items.push(itemVM);
      } else {
        categorizedItems[itemVM.mealPeriodId] = {
          mealPeriodId: itemVM.mealPeriodId,
          mealPeriodName: itemVM.mealPeriodName,
          items: [itemVM],
        };
      }
    });
    mealPeriods.forEach((mealPeriod) => {
      categorizedItems[mealPeriod.id] = {
        mealPeriodId: mealPeriod.id,
        mealPeriodName: mealPeriod.name,
        mealPeriodStartHour: mealPeriod.startHour,
        mealPeriodEndHour: mealPeriod.endHour,
        items: categorizedItems[mealPeriod.id]?.items ?? [],
      };
    });
    return RestApiResponse(
      new CategorizedItemVM(Object.values(categorizedItems)).build()
    );
  }

  @Get("s3/presign/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async presignUrl(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const expiresIn = 1800;
    const imageS3Name = getImageS3Name(+merchantId);
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType: null,
    });
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn,
    });
  }

  @Post("s3/presign/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async presignUrlPost(
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() presignUrlDTO: PresignUrlDTO
  ) {
    const expiresIn = 1800;
    const imageS3Name = getImageS3Name(+merchantId);
    const contentType = presignUrlDTO.contentType;
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType,
    });
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn,
      contentType,
    });
  }

  @Get(":id/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async findOne(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.findOne(+id, +merchantId);
    return RestApiResponse(new ItemVM(item).build());
  }

  @Patch(":id/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @Body() updateItemDTO: UpdateItemDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.update(+id, updateItemDTO, +merchantId);
    this.eventEmitter.emit(ITEM_UPDATED_EVENT, item.id);
    return RestApiResponse(new ItemVM(item).build());
  }

  @Delete(":id/merchant/:merchant_id")
  @UseGuards(AuthGuard)
  async remove(
    @Param("id") id: string,
    @Param("merchant_id") merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const deleted = await this.itemService.remove(+id, +merchantId);
    this.eventEmitter.emit(ITEM_DELETED_EVENT, +id);
    return RestApiResponse({
      deleted,
    });
  }
}
