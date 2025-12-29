import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { City } from '../../database/entities/city.entity';
import { cityProviders } from './city.providers';
import { CityService } from './city.service';
import { CITY_REPOSITORY } from '../../constants';
import { cityMockRepository, mockCity } from './city.mock';

describe('CityService', () => {
  let service: CityService;
  let repository: Repository<City>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityService, ...cityProviders],
    })
      .overrideProvider(CITY_REPOSITORY)
      .useFactory({
        factory: cityMockRepository,
      })
      .compile();

    service = module.get<CityService>(CityService);
    repository = module.get<Repository<City>>(CITY_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should return expected result', async () => {
    const data = await service.findOne(1);
    const findOneBySpy = jest.spyOn(repository, 'findOneBy');

    expect(data.id).toEqual(1);
    expect(data.name).toEqual(mockCity.name);
    expect(findOneBySpy).toHaveBeenCalled();
  });
});
