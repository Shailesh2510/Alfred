import { NestFactory } from '@nestjs/core';
import { SeedModule } from './cli/seed/module';
import { SeedCity } from './cli/seed/seed-cities';

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedCityService = app.select(SeedModule).get(SeedCity);
  await seedCityService.seed();
  await app.close();
}

main();
