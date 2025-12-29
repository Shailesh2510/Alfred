import { Body, Controller, Get, Header, Post, Query, Res, UseGuards, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { VoucherCodeService } from './voucher_code.service';
import { PaginateRequestDTO } from '../../pagination';
import { VoucherCodeVM } from './vm/voucher-code.vm';
import { HotelCreateVoucherCodeDTO, ListVoucherCodeFilters } from './dto/create-voucher-code.dto';
import { ExporterService } from 'src/exporter/exporter.service';
import type { Response } from 'express';

@ApiTags('Voucher Code (Hotel)')
@Controller('hotel/voucher/code')
@ApiBearerAuth()
export class HotelVoucherCodeController {
  constructor(
    private readonly voucherCodeService: VoucherCodeService,
    private readonly exporterService: ExporterService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Query() query: ListVoucherCodeFilters
  ) {
    const {data, total, take} = await this.voucherCodeService.findAll(authUser.hotelId, query);
    return RestApiResponse(new VoucherCodeVM(data).build(), {
      page: query.page,
      total,
      limit: take
    })
  }

  @Post('generate')
  @UseGuards(AuthGuard)
  async generate(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Body() dto: HotelCreateVoucherCodeDTO,
  ) {
    const data = await this.voucherCodeService.generate({
      ...dto,
      hotelId: authUser.hotelId
    });
    return RestApiResponse(new VoucherCodeVM(data).build())
  }

  @Get('reports/export')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/xls')
  async export(
    @Query() query: ListVoucherCodeFilters,
    @Res({ passthrough: true }) response: Response,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
  ) {
    const {data} = await this.voucherCodeService.findAll(authUser.hotelId, query);
    const buffer = await this.exporterService.getVoucherCodesExport(new VoucherCodeVM(data).build());
    response.set({
      'Content-Type': 'application/xls',
      'Content-Disposition': `attachment; filename="${Date.now()}-Voucher-Code-Report.xlsx"`,
    });
    
    //@ts-ignore
    return new StreamableFile(buffer);
  }
}
