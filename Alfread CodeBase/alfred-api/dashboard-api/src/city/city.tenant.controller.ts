import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { IRestAPIResponse, RestApiResponse } from 'helpers';
import { AuthGuard } from '../auth/auth.guard';
import { Tenant } from '../auth/tenant.decorator';
import { AuthUser } from '../auth/user.decorator';
import { CityService } from './city.service';
import { CreateCityDTO } from './dto/create-city.dto';
import { UpdateCityDTO } from './dto/update-city.dto';
import { CityVM } from './vm/city.vm';
import { CreateCityVM } from './vm/create-city.vm';

@ApiTags('City (Tenant)')
@Controller('tenant/city')
@ApiBearerAuth()
export class TenantCityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createCityDTO: CreateCityDTO,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
  ): Promise<IRestAPIResponse<CreateCityVM>> {
    const city = await this.cityService.create(createCityDTO)
    return RestApiResponse(new CityVM(city).build());
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Tenant() tenant,
  ): Promise<IRestAPIResponse<CityVM>> {
    const cities = await this.cityService.find()
    return RestApiResponse(new CityVM(cities).build());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
  ): Promise<IRestAPIResponse<CityVM>> {
    const city = await this.cityService.findOne({where: {
      id: +id
    }});
    return RestApiResponse(new CityVM(city).build());
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @AuthUser(UserType.TENANT_USER) authUser: InjectableUser,
    @Param('id') id: string,
    @Body() updateCityDTO: UpdateCityDTO
  ) {
    const city = await this.cityService.update({
      id: +id
    }, updateCityDTO)
    return RestApiResponse(new CityVM(city).build());
  }
}
