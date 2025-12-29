import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { BaseVM } from "../../base.vm";
import { DetailedMenuVM } from "../../menu/vm/menu.vm";
import { IsOptional } from "class-validator";

export class S3HotelVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose({
    name: "address_number",
  })
  addressNumber: string;

  @ApiProperty()
  @Expose({
    name: "address_street",
  })
  addressStreet: string;

  @ApiProperty()
  @Expose({
    name: "address_town",
  })
  addressTown: string;

  @ApiProperty()
  @Expose({
    name: "address_zip_code",
  })
  addressZipCode: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose({
    name: "web_code",
  })
  webCode: string;

  @ApiProperty()
  @Expose({
    name: "allow_credit_card",
  })
  allowCreditCard: boolean;

  @ApiProperty()
  @Expose({
    name: "allow_room_charge",
  })
  allowRoomCharge: boolean;

  @ApiProperty()
  @Expose({
    name: "is_tax_exempt",
  })
  isTaxExempt: boolean;

  @ApiProperty()
  @Expose({
    name: "city_id",
  })
  cityId: number;

  @ApiProperty()
  @Expose({
    name: "menu_id",
  })
  menuId: number;

  @ApiProperty()
  @Expose({
    name: "city_name",
  })
  cityName: string;

  @ApiProperty()
  @Expose({
    name: "is_active",
  })
  isActive: string;

  @ApiProperty()
  @Expose({
    name: "has_cutlery",
  })
  hasCutlery: string;

  @ApiProperty()
  @Expose()
  deliveryFee: number;

  @ApiProperty()
  @Expose()
  gxPhoneNumber: number;

  @ApiProperty()
  @Expose()
  timezone: string;

  @ApiProperty()
  @Expose()
  hasDeliveryFee: boolean;

  @ApiProperty()
  @Expose({ name: "enable_automatic_tip" })
  enableAutomaticTip: boolean;

  @ApiProperty()
  @Expose()
  coordinates: string;
  toVM<T>(input: T | T[]) {
    return plainToClass(S3HotelVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class HotelVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

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
  contactName: string;

  @ApiProperty()
  @Expose()
  contactEmail: string;

  @ApiProperty()
  @Expose()
  contactPhone: string;

  @ApiProperty()
  @Expose()
  billingEmail: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  webCode: string;

  @ApiProperty()
  @Expose()
  allowCreditCard: boolean;

  @ApiProperty()
  @Expose()
  allowRoomCharge: boolean;

  @ApiProperty()
  @Expose()
  isTaxExempt: boolean;

  @ApiProperty()
  @Expose()
  rooms: string[];

  @ApiProperty()
  @Expose()
  coordinates: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  deliveryInstructions: string;

  @ApiProperty()
  @Expose()
  isWebEnabled: boolean;

  @ApiProperty()
  @Expose()
  cityId: number;

  @ApiProperty()
  @Expose()
  menuId: number;

  @ApiProperty()
  @Expose()
  cityName: string;

  @ApiProperty()
  @Expose()
  taxRate: number;

  @ApiProperty()
  @Expose()
  timezone: string;

  @ApiProperty()
  @Expose()
  hasCutlery: boolean;

  @ApiProperty()
  @Expose()
  hasThirdPartyDelivery: boolean;

  @ApiProperty()
  @Expose()
  hasDeliveryFee: boolean;

  @ApiProperty()
  @Expose()
  enableAutomaticTip: boolean;

  toVM<T>(input: T | T[]) {
    return plainToClass(HotelVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class MealPeriodVM {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  startHour: string;

  @ApiProperty()
  @Expose()
  endHour: string;
}

export class PublicHotelVM extends HotelVM {
  @ApiProperty()
  @Expose()
  mealPeriods: MealPeriodVM[];
}

export class PublicHotelDetailsVM extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose({
    name: "web_code",
  })
  webCode: string;

  @ApiProperty()
  @Expose({
    name: "coordinates",
  })
  coordinates: string;

  @ApiProperty()
  @Expose({
    name: "address_number",
  })
  addressNumber: string;

  @ApiProperty()
  @Expose({
    name: "address_street",
  })
  addressStreet: string;

  @ApiProperty()
  @Expose({
    name: "address_town",
  })
  addressTown: string;

  @ApiProperty()
  @Expose({
    name: "address_zip_code",
  })
  addressZipCode: string;

  @ApiProperty()
  @Expose()
  cityName: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(PublicHotelDetailsVM, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedHotelMerchant extends BaseVM {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose({
    name: "contact_email",
  })
  contactEmail: string;

  @ApiProperty()
  @Expose({
    name: "contact_phone",
  })
  contactPhone: string;

  @ApiProperty()
  @Expose({
    name: "merchant_type",
  })
  merchantType: string;

  @ApiProperty()
  @Expose()
  mealPeriods: string[];

  @ApiProperty({ nullable: true })
  @Expose()
  @IsOptional()
  carmelMealPeriodId: number | null;

  @ApiProperty()
  @Expose()
  timezone: string;

  toVM<T>(input: T | T[]) {
    return plainToClass(DetailedHotelMerchant, input, {
      excludeExtraneousValues: true,
    });
  }
}

export class DetailedHotelVM extends HotelVM {
  @ApiProperty()
  @Expose()
  relatedMerchants: DetailedHotelMerchant[];

  @ApiProperty()
  @Expose()
  hotelMerchants: DetailedHotelMerchant[];

  @ApiProperty()
  @Expose()
  menu: DetailedMenuVM;

  toVM<T>(input: T | T[]) {
    return plainToClass(DetailedHotelVM, input, {
      excludeExtraneousValues: true,
    });
  }
}
