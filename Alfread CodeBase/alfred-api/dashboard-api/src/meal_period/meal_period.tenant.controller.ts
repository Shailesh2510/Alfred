import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
  Delete,
} from '@nestjs/common';
import { MealPeriodService } from './meal_period.service';
import { CreateMealPeriodDTO, TenantCreateMealPeriodDTO, UpdateMealPeriodDTO } from './dto/create-meal-period.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RestApiResponse } from 'helpers';
import { MealPeriodVM } from './vm/meal_period.vm';
import { AuthUser } from '../auth/user.decorator';
import { UserType } from '../../database/enums/usertype';
import { InjectableUser } from '../../database/entities/user.entity';
import { In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MEAL_PERIOD_DELETED_EVENT } from '../../events';
import { CityService } from 'src/city/city.service';
import { MerchantService } from 'src/merchant/merchant.service';

@ApiTags('Meal Period (Tenant)')
@Controller('tenant/meal_period')
@ApiBearerAuth()
export class TenantMealPeriodController {
  constructor(
    private readonly mealPeriodService: MealPeriodService,
    private readonly cityService: CityService,
    private readonly merchantService: MerchantService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() inputDTO: CreateMealPeriodDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.create(inputDTO);
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Post(`merchant/:merchant_id`)
  @UseGuards(AuthGuard)
  async createForMerchant(
    @Body() inputDTO: TenantCreateMealPeriodDTO,
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.create({
      ...inputDTO,
      merchantId: +merchantId,
    });
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.findAll();
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.findOne({where: {
      id: +id
    }});
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Get(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async findOneForMerchant(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.findOne({where: {
      id: +id,
      merchantId: +merchantId
    }});
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Delete(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async deleteForMerchant(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.softDelete({
      id: +id,
      merchantId: +merchantId,
    });
    this.eventEmitter.emit(MEAL_PERIOD_DELETED_EVENT, +merchantId);
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() inputDTO: UpdateMealPeriodDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.update({
      id: +id
    }, inputDTO);
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  @Patch(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async updateForMerchant(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @Body() inputDTO: UpdateMealPeriodDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.mealPeriodService.update({
      id: +id,
      merchantId: +merchantId
    }, inputDTO);
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  //merchant meal period logic
  @Get('merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async merchantFindAll(
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const citiesMap = await this.cityService.findAsMap();
    const merchant = await this.merchantService.findOne({
      where: {
        id: +merchantId
      }
    })
    const data = await this.mealPeriodService.findAll([+merchantId]);
    for (let i = 0; i < data.length; i++) {
      data[i].timezone = citiesMap[merchant.cityId]?.timezone ?? '';
    }
    return RestApiResponse(new MealPeriodVM(data).build());
  }

  //hotel meal period logic
  @Get('hotel/:hotel_id')
  @UseGuards(AuthGuard)
  async hotelFindAll(
    @Param('hotel_id') hotelId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const merchants = await this.mealPeriodService.findHotelMerchants(+hotelId);
    if (merchants.length == 0) {
      throw new HttpException(`Hotel has no merchant assigned`, HttpStatus.BAD_REQUEST);
    }
    const citiesMap = await this.cityService.findAsMap();
    const merchantsMap = {};
    merchants.forEach((merchant) => {
      merchantsMap[merchant.id] = {
        name: merchant.name,
        timezone: citiesMap[merchant.city_id]?.timezone ?? ''
      }
    })
    const data = await this.mealPeriodService.find({
      where: {
        id: In(merchants?.map(merchant => merchant.meal_period_id)),
      }
    });
    const output = data.map((mealPeriod) => {
      return {
        ...new MealPeriodVM(mealPeriod).build(),
        merchantName: merchantsMap[`${mealPeriod.merchantId}`]?.name,
        timezone: merchantsMap[`${mealPeriod.merchantId}`]?.timezone
      }
    })
    return RestApiResponse(output);
  }
}
