import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AssignMerchantHotelDTO {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ApiProperty()
  mealPeriodIds: string[];
}
