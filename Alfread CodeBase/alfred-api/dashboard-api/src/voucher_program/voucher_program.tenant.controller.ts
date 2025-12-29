import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { VoucherProgramService } from './voucher_program.service';
import { CreateVoucherProgramDTO } from './dto/create-voucher-program.dto';
import { DetailedVoucherProgramVM, VoucherProgramRuleVM, VoucherProgramVM } from './vm/voucher_program.vm';
import { UpdateVoucherProgramDTO } from './dto/update-voucher-program.dto';
import { VoucherProgramListQueryParams } from './dto/voucher-program.dto';
import { VoucherCodeService } from 'src/voucher_code/voucher_code.service';
import { VoucherProgramType } from 'database/entities/voucher_program.entity';

@ApiTags('Voucher Program (Tenant)')
@Controller('tenant/voucher/program')
@ApiBearerAuth()
export class TenantVoucherProgramController {
  constructor(
    private readonly voucherProgramService: VoucherProgramService,
    private readonly voucherCodeService: VoucherCodeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAllPagination(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Query() query: VoucherProgramListQueryParams
  ) {
    const {data, total, take} = await this.voucherProgramService.findAllPagination(null, query);
    return RestApiResponse(new VoucherProgramVM(data).build(), {
      page: query.page,
      total,
      limit: take
    })
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const voucherProgram = await this.voucherProgramService.findOneFromHotel(+id, null);
    
    if (!voucherProgram) {
      throw new HttpException('Voucher program not found', HttpStatus.NOT_FOUND);
    }
  
    const rules = await this.voucherProgramService.getVoucherProgramRules(+id, null);
    let discountCode = null;
    if (voucherProgram.type == VoucherProgramType.DISCOUNT) {
      try {
        discountCode = await this.voucherCodeService.findOne({
          where: {
            voucherProgramId: voucherProgram.id
          }
        })
      } catch (err) {
        //code not found
      }
    }
    return RestApiResponse({
      ...new DetailedVoucherProgramVM({
        ...voucherProgram,
        rules: rules.map((rule) => ({
          id: rule.id,
          voucherProgramId: rule.voucher_program_id,
          mealPeriodId: rule.meal_period_id,
          menuCategoryIds: rule.menu_category_ids,
          quantity: rule.quantity,
          maxPrice: rule.max_price,
        }))
      }).build(),
      ...(discountCode != null ? { discountCode } : null)
    });
  }

  @Get(':id/rules')
  @UseGuards(AuthGuard)
  async findRules(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const rules = await this.voucherProgramService.getVoucherProgramRules(+id, null);
    return RestApiResponse(new VoucherProgramRuleVM(rules).build());
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateVoucherProgramDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const voucherProgram = await this.voucherProgramService.create(dto);
    return RestApiResponse(new VoucherProgramVM(voucherProgram).build());
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVoucherProgramDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const voucherProgram = await this.voucherProgramService._update({
      id: +id
    }, dto);
    return RestApiResponse(new VoucherProgramVM(voucherProgram).build());
  }
}
