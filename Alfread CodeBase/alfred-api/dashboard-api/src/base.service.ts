import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { ENTITY_FAILED_TO_SAVE_MESSAGE, ENTITY_FAILED_TO_UPDATE_MESSAGE, ENTITY_NOT_FOUND_MESSAGE } from "error";

@Injectable()
export class BaseService<T, K, J> {
  logger = new Logger();
  //this repo should be injected from the extending class
  protected _repository: Repository<T>;

  async create(dto: ObjectLiteral extends K ? any : any) {
    try {
      return await this._repository.save(dto)
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@create]: ${err.mesage}`)
      this.logger.error(err.stack)
      throw new HttpException(ENTITY_FAILED_TO_SAVE_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findOne(options: FindOneOptions<T>) {
    let platform = null;
    try {
      platform = await this._repository.findOne(options)
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@findOne]: ${err.mesage}`)
      //todo: throw 'where' critera error or similar
    }
    if (!platform) {
      throw new HttpException(ENTITY_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND);
    }
    return platform
  }

  async find(options?: FindManyOptions<T>) {
    let data = []
    try {
      data = await this._repository.find(options);
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@find]: ${err}`)
      //todo: throw 'where' critera error or similar
    }
    return data;
  }

  async findAsMap() {
    const data = await this.find();
    const map = {}
    data.forEach(entity => map[entity.id] = entity)
    return map
  }

  async update(where: FindOptionsWhere<T>, dto: ObjectLiteral extends J ? any : any) {
    try {
      await this._repository.update(where, {
        ...dto
      })
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@update]: ${err.mesage}`)
      this.logger.error(err.stack)
      throw new HttpException(ENTITY_FAILED_TO_UPDATE_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    return where['id'] != null ? await this.findOne({where}) : await this.find({where});
  }

  async delete(where: FindOptionsWhere<T>) {
    await this.findOne({where});
    try {
      await this._repository.delete(where)
      return true
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@delete]: ${err.mesage}`)
      this.logger.error(err.stack)
    }
    return false;
  }

  async softDelete(where: FindOptionsWhere<T>) {
    await this.findOne({where});
    try {
      await this._repository.softDelete(where)
      return true
    } catch (err) {
      this.logger.error(`[${this.constructor.name}@softDelete]: ${err.mesage}`)
      this.logger.error(err.stack)
    }
    return false;
  }
}
