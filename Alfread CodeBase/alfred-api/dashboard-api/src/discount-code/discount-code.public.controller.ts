import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RestApiResponse } from 'helpers';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { DiscountCodeService } from './discount-code.service';
import { DiscountCodeClientFilters } from './discount-code.dto';

@ApiTags('Discount code (Public)')
@Controller('gateway/discount/code/public')
@ApiBearerAuth()
export class PublicDiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  @Get(':code/hotel/:hotel_uuid')
  @UseGuards(ApiKeyGuard)
  async findByCode(
    @Param('code') code: string,
    @Param('hotel_uuid') hotelUuid: string,
    @Query() query: DiscountCodeClientFilters
  ) {
    if (query.clientEmail == null || query.clientEmail?.trim() == "") {
      throw new HttpException(`Client email query param missing`, HttpStatus.BAD_REQUEST);
    }
    if (query.clientNumber == null || query.clientNumber?.trim() == "") {
      throw new HttpException(`Client number query param missing`, HttpStatus.BAD_REQUEST);
    }
    const discountCode = await this.discountCodeService.findByCode(code, hotelUuid, query.clientEmail, query.clientNumber);
    return RestApiResponse(discountCode)
  }
}
