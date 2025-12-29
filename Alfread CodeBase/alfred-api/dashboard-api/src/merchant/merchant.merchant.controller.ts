import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { InjectableUser } from '../../database/entities/user.entity';
import { AuthUser } from '../auth/user.decorator';
import { UserType } from '../../database/enums/usertype';
import { MerchantService } from './merchant.service';
import { MerchantHotelVM } from './vm/merchant.vm';

@ApiTags('Merchant (Merchant)')
@Controller('merchant/merchant')
@ApiBearerAuth()
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async findAuthHotel(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const merchant = await this.merchantService.findOne({where: {
      id: +authUser.merchantId
    }});
    return RestApiResponse(merchant);
  }

  @Get('hotels')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    const { relatedHotels } = await this.merchantService.findMerchantHotelsWithMealPeriods(authUser.merchantId)
    const hotelsMap = {};
    for (let i = 0; i < relatedHotels.length; i++) {
      hotelsMap[relatedHotels[i].id] = {
        ...relatedHotels[i],
      };
    }
    return RestApiResponse(new MerchantHotelVM(Object.values(hotelsMap)).build());
  }
}
