import { MockType } from 'helpers';
import { Repository } from 'typeorm';
import { CreateCityDTO } from './dto/create-city.dto';

export const mockCity = {
  id: 1,
  name: 'TestCity',
};

export const cityMockRepository: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOneBy: jest.fn((where: any) => {
      return {
        ...mockCity,
        id: where.id,
      };
    }),
    save: jest.fn((payload: CreateCityDTO) => {
      return {
        id: 1,
        version: 1,
        ...payload,
      };
    }),
  }),
);
