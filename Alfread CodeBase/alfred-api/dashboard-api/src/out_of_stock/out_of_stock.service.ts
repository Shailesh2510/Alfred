import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { OUT_OF_STOCK_REPOSITORY } from "../../constants";
import { OutOfStock } from "database/entities/out_of_stock.entity";
import { LessThan, Repository } from "typeorm";
import { CreateOutOfStockDTO } from "./dto/create.dto";
import { BaseService } from "src/base.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ITEM_OUT_OF_STOCK_EVENT } from "../../events";

@Injectable()
export class OutOfStockService extends BaseService<OutOfStock, CreateOutOfStockDTO, {}> {
  logger = new Logger();
  @Inject(OUT_OF_STOCK_REPOSITORY)
  protected readonly _repository: Repository<OutOfStock>;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2

  async deleteAllBeforeNow() {
    try {
      const entities = await this._repository.find({
        where: {
          availableAfter: LessThan(new Date(Date.now()))
        }
      })
      const res = await this._repository.delete({
        availableAfter: LessThan(new Date(Date.now()))
      });
      if (res.affected) {
        for (let i = 0; i < entities.length; i++) {
          this.eventEmitter.emit(ITEM_OUT_OF_STOCK_EVENT, entities[i].id)
        }
        console.log('new Date(Date.now()): ', new Date(Date.now()));
        this.logger.debug(`deleteAllBeforeNow, affected rows: ${res.affected}`)
      }
    } catch (err) {
      this.logger.error(`OutOfStockService@deleteAllBeforeNow: ${err}`)
      return false
    }
    return true
  }
}
