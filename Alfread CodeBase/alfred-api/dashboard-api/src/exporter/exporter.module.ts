import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ExporterService } from './exporter.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [ExporterService],
  exports: [ExporterService]
})
export class ExporterModule {}
