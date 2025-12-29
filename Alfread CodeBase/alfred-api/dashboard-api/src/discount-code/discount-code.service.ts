import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DISCOUNT_CODE_REPOSITORY } from '../../constants';
import { Repository } from 'typeorm';
import { BaseService } from '../base.service';
import { DiscountCode, DiscountCodeAccessType, DiscountCodeType } from '../../database/entities/discount-code.entity';
import { APICreateDiscountCodeDTO } from './create-discount-code.dto';

@Injectable()
export class DiscountCodeService extends BaseService<DiscountCode, {}, {}> {
  @Inject(DISCOUNT_CODE_REPOSITORY)
  protected _repository: Repository<DiscountCode>;

  async create(dto: APICreateDiscountCodeDTO): Promise<DiscountCode> {
    if (dto.accessType === DiscountCodeAccessType.HOTEL && dto.hotelIds?.length == 0) {
      throw new HttpException(`Hotel ids empty`, HttpStatus.BAD_REQUEST);
    }
    return await this.create(dto);
  }

  async findByCode(code: string, hotelUuid: string, clientEmail: string, clientNumber: string) {
    const result = await this._repository.query(
      `
      select
      dc.code,
      dc.type,
      dc.access_type,
      dc.total_amount,
      dc.amount_type
      from discount_codes dc
      inner join discount_code_hotel dch on dch.discount_code_id = dc.id
      inner join hotels h on h.id = dch.hotel_id
      where lower(dc.code) = lower($1) and h._id = $2
      `,
      [
        code,
        hotelUuid
      ]
    )
    let discountCode = null;
    if (result?.length > 0) {
      discountCode = result[0];
    }
    if (discountCode.type == DiscountCodeType.SINGLE_USER) {
      const discountCodeLog = await this._repository.query(`
        select
        from
        order_discount_code_logs odcl
        where
        odcl.code = $1 and lower(odcl.client_email) = $2 and lower(odcl.client_number) = $3
      `, [
        code,
        clientEmail,
        clientNumber
      ]);
      if (discountCodeLog?.length > 0) {
        throw new HttpException("User already used discount code", HttpStatus.CONFLICT);
      }
    }
    return discountCode;
  }
}
