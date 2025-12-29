import { Inject } from '@nestjs/common';
import { CITY_REPOSITORY } from '../../../constants';
import { City } from '../../../database/entities/city.entity';
import { Repository } from 'typeorm';

const cities = [
  {
    id: 1,
    name: 'NYC',
    state: 'NY',
    zipCode: '9999',
    timezone: 'us-east',
  },
];

export class SeedCity {
  @Inject(CITY_REPOSITORY)
  private readonly cityRepository: Repository<City>;

  async seed() {
    await this.cityRepository.save(cities);
  }
}
