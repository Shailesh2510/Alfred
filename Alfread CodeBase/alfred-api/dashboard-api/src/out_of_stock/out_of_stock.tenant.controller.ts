import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { InjectableUser } from '../../database/entities/user.entity';
import { AuthUser } from 'src/auth/user.decorator';
import { RestApiResponse } from 'helpers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserType } from 'database/enums/usertype';
import { AuthGuard } from 'src/auth/auth.guard';
import { OutOfStockService } from './out_of_stock.service';
import { APICreateOutOfStockDTO } from './dto/create.dto';
import { OutOfStockVM } from './vm/out_of_stock.vm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ITEM_OUT_OF_STOCK_EVENT } from '../../events';

@ApiTags('Out of stock (Tenant)')
@Controller('tenant/out_of_stock')
@ApiBearerAuth()
export class TenantOutOfStockController {
  constructor(
    private readonly outOfStockService: OutOfStockService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post('merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async create(
    @Param('merchant_id') merchantId: string,
    @Body() dto: APICreateOutOfStockDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    if (dto.out === "false") {
      return await this.putBackOnStock(dto, +merchantId);
    }
    try {
      await this.outOfStockService.findOne({
        where: {
          itemId: dto.itemId,
          merchantId: +merchantId
        }
      })
    } catch (err) {
      const data = await this.outOfStockService.create({
        ...dto,
        merchantId: +merchantId
      });
      this.eventEmitter.emit(ITEM_OUT_OF_STOCK_EVENT, dto.itemId);
      return RestApiResponse(new OutOfStockVM(data).build());
    }
    return RestApiResponse({
      message: "Item already out of stock"
    });
  }

  async putBackOnStock(dto: APICreateOutOfStockDTO, merchantId: number) {
    const outofstockEntity = await this.outOfStockService.findOne({
      where: {
        itemId: dto.itemId,
        merchantId: +merchantId
      }
    })
    await this.outOfStockService.delete({
      itemId: dto.itemId,
      merchantId: +merchantId
    });
    this.eventEmitter.emit(ITEM_OUT_OF_STOCK_EVENT, dto.itemId);
    return RestApiResponse(outofstockEntity);
  }
}
