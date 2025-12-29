import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { TenantCityController } from './city.tenant.controller';
import { DatabaseModule } from 'database/database.module';
import { cityProviders } from './city.providers';
import { AuthModule } from '../auth/auth.module';
import { PublicCityController } from './city.public.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule],
  controllers: [TenantCityController, PublicCityController],
  providers: [CityService, ...cityProviders],
  exports: [CityService]
})
export class CityModule {}
