import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCityDTO } from './dto/create-city.dto';
import { UpdateCityDTO } from './dto/update-city.dto';
import { City } from '../../database/entities/city.entity';
import { CITY_REPOSITORY } from '../../constants';
import { BaseService } from 'src/base.service';

@Injectable()
export class CityService extends BaseService<City, CreateCityDTO, UpdateCityDTO> {
  @Inject(CITY_REPOSITORY)
  protected _repository: Repository<City>;
}
