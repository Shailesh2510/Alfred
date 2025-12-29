import { plainToClass } from "class-transformer";
import { AuditEntity } from "./audit.entity";
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MealPeriod } from "./meal_period.entity";
import { MerchantType } from "database/enums/merchantType";

@Entity("merchants")
export class Merchant extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({
    type: "point",
  })
  coordinates: string;

  @Column({
    name: "city_id",
  })
  cityId: number;

  @Column({
    name: "tax_rate",
  })
  taxRate: string;

  @Column({
    name: "contact_email",
  })
  contactEmail: string;

  @Column({
    name: "description",
  })
  description: string;

  @Column({
    name: "contact_phone",
  })
  contactPhone: string;

  @Column({
    name: "address_number",
  })
  addressNumber: string;

  @Column({
    name: "address_street",
  })
  addressStreet: string;

  @Column({
    name: "address_town",
  })
  addressTown: string;

  @Column({
    name: "address_zip_code",
  })
  addressZipCode: string;

  @Column({
    name: "is_active",
  })
  isActive: boolean;

  @Column({
    name: "has_third_party_delivery",
  })
  hasThirdPartyDelivery: boolean;

  @Column({
    name: "image_url",
  })
  imageUrl: string;

  @Column({
    name: "cover_image_url",
  })
  coverImageUrl: string;

  @Column({
    name: "allow_catering",
    default: false,
  })
  allowCatering: boolean;

  @Column({
    name: "merchant_type",
  })
  merchantType: MerchantType;

  @Column({
    name: "color",
    type: "varchar",
    length: 7,
    nullable: false,
    default: "#000000",
  })
  color: string;

  @Column()
  eta: number;

  @OneToMany(() => MealPeriod, (mealperiod) => mealperiod.merchant)
  @JoinColumn({ name: "id", referencedColumnName: "merchant_id" })
  mealPeriods: MealPeriod[];

  toEntity<T>(input: T | T[]) {
    return plainToClass(Merchant, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("merchant_hotel")
export class MerchantHotel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column({
    name: "hotel_id",
  })
  hotelId: number;

  @Column({
    name: "order_position",
  })
  orderPosition: number;

  @Column({
    name: "meal_period_id",
  })
  mealPeriodId: number;
}
