import { PartialType } from '@nestjs/swagger';
import { APICreateItemDTO, CreateItemDTO } from './create-item.dto';

export class UpdateItemDTO extends PartialType(APICreateItemDTO) {}
