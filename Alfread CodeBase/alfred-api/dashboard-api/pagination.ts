import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNumber } from "class-validator";

export class PaginateRequestDTO {
  @IsNumber()
  @ApiProperty()
  @Transform((val: TransformFnParams) => parseInt(val.value))
  page: number;
}

export function getPaginationData(pageInput: number) {
  const take = parseInt(process.env.PAGINATION_TAKE) || 20;
  const page = pageInput > 0 ? pageInput : 1 || 1;
  const skip = (page - 1) * take;

  return {
    take,
    page,
    skip
  }
}
