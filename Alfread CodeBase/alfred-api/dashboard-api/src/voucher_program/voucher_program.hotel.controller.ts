import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { VoucherProgramService } from './voucher_program.service';
import { DetailedVoucherProgramVM, VoucherProgramRuleVM, VoucherProgramVM } from './vm/voucher_program.vm';

@ApiTags('Voucher Program (Hotel)')
@Controller('hotel/voucher/program')
@ApiBearerAuth()
export class HotelVoucherProgramController {
  constructor(private readonly voucherProgramService: VoucherProgramService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() _: TenantImpersonateQueryParams,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
  ) {
    const data = await this.voucherProgramService.findAll(authUser.hotelId);
    return RestApiResponse(new VoucherProgramVM(data).build())
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const voucherProgram = await this.voucherProgramService.findOneFromHotel(+id, authUser.hotelId);
    const rules = await this.voucherProgramService.getVoucherProgramRules(+id, authUser.hotelId);
    return RestApiResponse(new DetailedVoucherProgramVM({
      ...voucherProgram,
      rules
    }).build());
  }

  @Get(':id/rules')
  @UseGuards(AuthGuard)
  async findRules(
    @Query() _: TenantImpersonateQueryParams,
    @Param('id') id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser
  ) {
    const rules = await this.voucherProgramService.getVoucherProgramRules(+id, authUser.hotelId);
    return RestApiResponse(new VoucherProgramRuleVM(rules).build());
  }
}
