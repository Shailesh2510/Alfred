import { Inject, Injectable } from "@nestjs/common";
import { PG_DATA_SOURCE } from "../../constants";
import { DataSource, QueryRunner } from "typeorm";

@Injectable()
export class TransactionManagerService {
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;

  async executeInTransaction<T>(
    work: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
