import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RestApiResponse } from 'helpers';
import { VoucherCodeService } from './voucher_code.service';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('Voucher Code (Public)')
@Controller('gateway/voucher/code/public')
@ApiBearerAuth()
export class PublicVoucherCodeController {
  constructor(private readonly voucherCodeService: VoucherCodeService) {}

  @Get(':code/hotel/:hotel_uuid')
  @UseGuards(ApiKeyGuard)
  async findAll(
    @Param('code') code: string,
    @Param('hotel_uuid') hotelUuid: string,
  ) {
    const voucherCode = await this.voucherCodeService.findByCode(code, hotelUuid);
    return RestApiResponse(voucherCode)
  }
}
