import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { outOfStockProviders } from './out_of_stock.providers';
import { TenantOutOfStockController } from './out_of_stock.tenant.controller';
import { OutOfStockService } from './out_of_stock.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TenantOutOfStockController],
  providers: [OutOfStockService, ...outOfStockProviders],
  exports: [OutOfStockService]
})
export class OutOfStockModule {}
