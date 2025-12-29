import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { APIAssignItemsToMealPeriodDTO, APICreateItemDTO } from './dto/create-item.dto';
import { UpdateItemDTO } from './dto/update-item.dto';
import { AuthUser } from 'src/auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { RestApiResponse, TenantImpersonateQueryParams, getImageS3Name, getImageUrl, getMenuS3Bucket } from 'helpers';
import { CategorizedItemVM, DetailedItemVM, ItemVM, SimpleListItemVM } from './vm/item.vm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserType } from '../../database/enums/usertype';
import { AuthGuard } from '../auth/auth.guard';
import { S3Service } from '../aws/s3.service';
import { MealPeriodService } from '../meal_period/meal_period.service';
import { PresignUrlDTO } from './dto/presign-url.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ITEM_UPDATED_EVENT, ITEM_DELETED_EVENT } from '../../events';

//This is not being used as all the logic has been moved to item.tenant.controller
@ApiTags('Item (Merchant)')
@Controller('merchant/item')
@ApiBearerAuth()
export class MerchantItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly s3Service: S3Service,
    private readonly mealPeriodService: MealPeriodService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Query() _: TenantImpersonateQueryParams,
    @Body() createItemDTO: APICreateItemDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.create(
      createItemDTO,
      authUser.merchantId
    );
    return RestApiResponse(new ItemVM(item).build());
  }

  @Post('assign/meal_period')
  @UseGuards(AuthGuard)
  async batchAssignToMealPeriod(
    @Query() _: TenantImpersonateQueryParams,
    @Body() payloadDTO: APIAssignItemsToMealPeriodDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const completed = await this.itemService.batchAssignToMealPeriod(
      authUser.merchantId,
      payloadDTO.mealPeriodId,
      payloadDTO.itemIds
    );
    return RestApiResponse({
      completed
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const items = await this.itemService.findAll(authUser.merchantId);
    const itemModifiers = await this.itemService.getItemModifiers(items.map(item => item.id))
    const itemsModifiersMap = {};
    for (let i = 0; i < itemModifiers.length; i++) {
      if (itemsModifiersMap[itemModifiers[i]?.item_id]) {
        itemsModifiersMap[itemModifiers[i]?.item_id].push(itemModifiers[i])
      } else {
        itemsModifiersMap[itemModifiers[i]?.item_id] = []
        itemsModifiersMap[itemModifiers[i]?.item_id].push(itemModifiers[i])
      }
    }

    const itemsMap = {}
    items.forEach((item) => {
      itemsMap[item.id] = {
        ...item,
        modifiers: itemsModifiersMap[item.id]
      }
    })
    return RestApiResponse(new SimpleListItemVM(Object.values(itemsMap)).build());
  }

  @Get('list/categorized')
  @UseGuards(AuthGuard)
  async categorized(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const items = await this.itemService.findAll(authUser.merchantId);
    const mealPeriods = await this.mealPeriodService.findAll([authUser.merchantId]);
    const itemModifiers = await this.itemService.getItemModifiers(items.map(item => item.id))
    const itemsModifiersMap = {};
    for (let i = 0; i < itemModifiers.length; i++) {
      if (itemsModifiersMap[itemModifiers[i]?.item_id]) {
        itemsModifiersMap[itemModifiers[i]?.item_id].push(itemModifiers[i])
      } else {
        itemsModifiersMap[itemModifiers[i]?.item_id] = []
        itemsModifiersMap[itemModifiers[i]?.item_id].push(itemModifiers[i])
      }
    }
    const categorizedItems = {};
    const itemsArr: DetailedItemVM[] = []
    items?.forEach(item => {
      const itemVM = new ItemVM(item).build()
      itemVM.mealPeriods?.forEach(mealPeriod => {
        itemsArr.push({
          ...itemVM,
          mealPeriodId: mealPeriod.id,
          mealPeriodName: mealPeriod.name,
          modifiers: itemsModifiersMap[item.id]
        })
      })
    })
    itemsArr.forEach(itemVM => {
      if (categorizedItems[itemVM.mealPeriodId]) {
        categorizedItems[itemVM.mealPeriodId].items.push(itemVM)
      } else {
        categorizedItems[itemVM.mealPeriodId] = {
          mealPeriodId: itemVM.mealPeriodId,
          mealPeriodName: itemVM.mealPeriodName,
          items: [itemVM]
        }
      }
    })
    mealPeriods.forEach((mealPeriod) => {
      categorizedItems[mealPeriod.id] = {
        mealPeriodId: mealPeriod.id,
        mealPeriodName: mealPeriod.name,
        mealPeriodStartHour: mealPeriod.startHour,
        mealPeriodEndHour: mealPeriod.endHour,
        items: categorizedItems[mealPeriod.id]?.items ?? []
      }
    })
    return RestApiResponse(new CategorizedItemVM(Object.values(categorizedItems)).build())
  }

  @Get('s3/presign')
  @UseGuards(AuthGuard)
  async presignUrl(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const expiresIn = 1800
    const imageS3Name = getImageS3Name(authUser.merchantId);
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType: null
    })
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn
    })
  }

  @Post('s3/presign')
  @UseGuards(AuthGuard)
  async presignUrlPost(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser,
    @Body() presignUrlDTO: PresignUrlDTO
  ) {
    const expiresIn = 1800
    const imageS3Name = getImageS3Name(authUser.merchantId);
    const contentType = presignUrlDTO.contentType;
    const url = await this.s3Service.createPresignedUrl({
      bucket: getMenuS3Bucket(),
      key: imageS3Name,
      expiresIn,
      contentType,
    })
    return RestApiResponse({
      url,
      imageUrl: getImageUrl(imageS3Name),
      expiresIn,
      contentType
    })
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.findOne(+id, authUser.merchantId);
    return RestApiResponse(new ItemVM(item).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @Body() updateItemDTO: UpdateItemDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const item = await this.itemService.update(+id, updateItemDTO, authUser.merchantId);
    this.eventEmitter.emit(ITEM_UPDATED_EVENT, item.id);
    return RestApiResponse(new ItemVM(item).build());
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const deleted = await this.itemService.remove(+id, authUser.merchantId);
    this.eventEmitter.emit(ITEM_DELETED_EVENT, +id);
    return RestApiResponse({
      deleted
    })
  }
}
