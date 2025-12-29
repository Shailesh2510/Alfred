import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HotelMealPeriodMappingDTO {
  @IsNumber()
  hotelId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  mealPeriodIds: number[];
}

export class AssignHotelsToMerchantWithMealPeriodsDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelMealPeriodMappingDTO)
  hotelMealPeriodMappings: HotelMealPeriodMappingDTO[];
}
