import { Module } from '@nestjs/common';
import { cityProviders } from '../../city/city.providers';
import { DatabaseModule } from '../../../database/database.module';
import { SeedCity } from './seed-cities';

@Module({
  imports: [DatabaseModule],
  providers: [SeedCity, ...cityProviders],
})
export class SeedModule {}
