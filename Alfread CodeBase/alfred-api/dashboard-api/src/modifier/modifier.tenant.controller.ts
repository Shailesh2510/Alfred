import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModifierService } from './modifier.service';
import { CreateModifierDTO } from './dto/create-modifier.dto';
import { UpdateModifierDTO } from './dto/update-modifier.dto';
import { InjectableUser } from '../../database/entities/user.entity';
import { AuthUser } from 'src/auth/user.decorator';
import { RestApiResponse } from 'helpers';
import { ModifierVM } from './vm/modifier.vm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserType } from 'database/enums/usertype';
import { AuthGuard } from 'src/auth/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MODIFIER_DELETED_EVENT, MODIFIER_UPDATED_EVENT } from '../../events';

@ApiTags('Modifier (Tenant)')
@Controller('tenant/modifier')
@ApiBearerAuth()
export class TenantModifierController {
  constructor(
    private readonly modifierService: ModifierService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post('merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async create(
    @Param('merchant_id') merchantId: string,
    @Body() createModifierDTO: CreateModifierDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const [modifier, options] = await this.modifierService._create(
      createModifierDTO, +merchantId
    );
    return RestApiResponse(new ModifierVM({
      ...modifier,
      options
    }).build())
  }

  @Get('merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async findAll(
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const modifiers = await this.modifierService.findAll(+merchantId);
    return RestApiResponse(new ModifierVM(modifiers).build())
  }

  @Get(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const modifier = await this.modifierService._findOne(+id, +merchantId);
    return RestApiResponse(new ModifierVM(modifier).build())
  }

  @Patch(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @Body() updateModifierDTO: UpdateModifierDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const modifier = await this.modifierService._update(
      +id,
      updateModifierDTO,
      +merchantId
    );
    this.eventEmitter.emit(MODIFIER_UPDATED_EVENT, modifier.id);
    return RestApiResponse(new ModifierVM(modifier).build())
  }

  @Delete(':id/merchant/:merchant_id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @Param('merchant_id') merchantId: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser
  ) {
    const deleted = await this.modifierService.remove(+id, +merchantId);
    this.eventEmitter.emit(MODIFIER_DELETED_EVENT, +id);
    return RestApiResponse({
      deleted
    })
  }
}
