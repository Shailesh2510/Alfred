import { Module } from "@nestjs/common";
import { TransactionManagerService } from "./transaction-manager.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "database/database.module";

@Module({
  imports: [TypeOrmModule.forFeature([]), DatabaseModule],
  providers: [TransactionManagerService],
  exports: [TransactionManagerService],
})
export class TransactionManagerModule {}
