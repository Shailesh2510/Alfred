import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, plainToClass } from 'class-transformer';
import { BaseVM } from '../../base.vm';
import { MealPeriodVM } from 'src/meal_period/vm/meal_period.vm';

export class MerchantVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({
    type: 'Point'
  })
  @Expose()
  coordinates: string;

  @ApiProperty()
  @Expose()
  cityId: number;

  @ApiProperty()
  @Expose()
  cityName: string;

  @ApiProperty()
  @Expose()
  taxRate: number;

  @ApiProperty()
  @Expose()
  contactEmail: string;

  @ApiProperty()
  @Expose()
  contactPhone: string;

  @ApiProperty()
  @Expose()
  addressNumber: string;

  @ApiProperty()
  @Expose()
  addressStreet: string;

  @ApiProperty()
  @Expose()
  addressTown: string;

  @ApiProperty()
  @Expose()
  addressZipCode: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  color: string;
  
  @ApiProperty()
  @Expose()
  @Type(() => MealPeriodVM)
  mealPeriods: MealPeriodVM[]

  toVM<T>(input: T | T[]) {
    return plainToClass(MerchantVM, input, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true
    });
  }
}

export class MerchantHotelVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose({name: 'address_number'})
  addressNumber: string;

  @ApiProperty()
  @Expose({name: 'address_street'})
  addressStreet: string;

  @ApiProperty()
  @Expose({name: 'address_town'})
  addressTown: string;

  @ApiProperty()
  @Expose({name: 'address_zip_code'})
  addressZipCode: string;

  @ApiProperty()
  @Expose({name: 'contact_name'})
  contactName: string;

  @ApiProperty()
  @Expose({name: 'contact_email'})
  contactEmail: string;

  @ApiProperty()
  @Expose({name: 'contact_phone'})
  contactPhone: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose({name: 'web_code'})
  webCode: string;

  @ApiProperty()
  @Expose({name: 'allow_credit_card'})
  allowCreditCard: boolean;

  @ApiProperty()
  @Expose({name: 'allow_room_charge'})
  allowRoomCharge: boolean;

  @ApiProperty()
  @Expose({name: 'is_tax_exempt'})
  isTaxExempt: boolean;

  @ApiProperty()
  @Expose()
  rooms: string[];

  @ApiProperty()
  @Expose()
  coordinates: string;

  @ApiProperty()
  @Expose({name: 'is_active'})
  isActive: boolean;

  @ApiProperty()
  @Expose({name: 'delivery_instructions'})
  deliveryInstructions: string;

  @ApiProperty()
  @Expose({name: 'is_web_enabled'})
  isWebEnabled: boolean;

  @ApiProperty()
  @Expose({name: 'city_id'})
  cityId: number;

  @ApiProperty()
  @Expose({name: 'menu_id'})
  menuId: number;

  @ApiProperty()
  @Expose({name: 'city_name'})
  cityName: string;

  @ApiProperty()
  @Expose()
  mealPeriods: any[];

  @ApiProperty()
  @Expose()
  timezone: string;
  
  toVM<T>(input: T | T[]) {
    return plainToClass(MerchantHotelVM, input, {
      excludeExtraneousValues: true,
    }); 
  }
}
