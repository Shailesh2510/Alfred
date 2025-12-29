import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { VoucherCodeService } from './voucher_code.service';
import { PaginateRequestDTO } from '../../pagination';
import { VoucherCodeVM } from './vm/voucher-code.vm';
import { CreateVoucherCodeDTO } from './dto/create-voucher-code.dto';
import { VoucherCodeListQueryParams } from './dto/voucher-code.dto';

@ApiTags('Voucher Code (Tenant)')
@Controller('tenant/voucher/code')
@ApiBearerAuth()
export class TenantVoucherCodeController {
  constructor(private readonly voucherCodeService: VoucherCodeService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: VoucherCodeListQueryParams
  ) {
    const {data, total, take} = await this.voucherCodeService.findAll(null, query);
    return RestApiResponse(new VoucherCodeVM(data).build(), {
      page: query.page,
      total,
      limit: take
    })
  }

  @Post('generate')
  @UseGuards(AuthGuard)
  async generate(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Body() dto: CreateVoucherCodeDTO,
  ) {
    const data = await this.voucherCodeService.generate(dto);
    return RestApiResponse(new VoucherCodeVM(data).build())
  }
}
