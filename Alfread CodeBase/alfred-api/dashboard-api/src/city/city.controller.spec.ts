import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CITY_REPOSITORY } from '../../constants';
import { CityController } from './city.tenant.controller';
import { City } from '../../database/entities/city.entity';
import { cityMockRepository } from './city.mock';
import { cityProviders } from './city.providers';
import { CityService } from './city.service';

describe('CityController', () => {
  let controller: CityController;
  let service: CityService;
  let repository: Repository<City>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [CityService, ...cityProviders],
    })
      .overrideProvider(CITY_REPOSITORY)
      .useFactory({
        factory: cityMockRepository,
      })
      .compile();

    controller = module.get<CityController>(CityController);
    service = module.get<CityService>(CityService);
    repository = module.get<Repository<City>>(CITY_REPOSITORY);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
});
