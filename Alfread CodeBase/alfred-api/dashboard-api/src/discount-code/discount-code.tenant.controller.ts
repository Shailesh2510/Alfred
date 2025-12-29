import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/user.decorator';
import { DiscountCodeService } from './discount-code.service';
import { DiscountCodeVM } from './discount-code.vm';
import { APICreateDiscountCodeDTO, APIUpdateDiscountCodeDTO } from './create-discount-code.dto';

@ApiBearerAuth()
@ApiTags('Discount code (Tenant)')
@Controller('tenant/discount-code')
export class TenantDiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: APICreateDiscountCodeDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const discountCode = await this.discountCodeService.create(dto);
    return RestApiResponse(new DiscountCodeVM(discountCode).build())
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const data = await this.discountCodeService.find();
    return RestApiResponse(new DiscountCodeVM(data).build())
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @AuthUser(UserType.TENANT_USER) authUser: InjectableUser) {
    const data = await this.discountCodeService.findOne({
      where: {
        id: +id
      }
    });
    return RestApiResponse(new DiscountCodeVM(data).build())
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: APIUpdateDiscountCodeDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const data = await this.discountCodeService.update({ id: +id }, dto);
    return RestApiResponse(new DiscountCodeVM(data).build())
  }
}
