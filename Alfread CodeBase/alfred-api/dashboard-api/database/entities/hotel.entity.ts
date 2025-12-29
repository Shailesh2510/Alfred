import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("hotels")
export class Hotel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "_id",
  })
  _id: string;

  @Column()
  name: string;

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
    name: "contact_name",
  })
  contactName: string;

  @Column({
    name: "contact_email",
  })
  contactEmail: string;

  @Column({
    name: "contact_phone",
  })
  contactPhone: string;

  @Column({
    name: "billing_email",
  })
  billingEmail: string;

  @Column()
  code: string;

  @Column({
    name: "web_code",
  })
  webCode: string;

  @Column({
    name: "allow_credit_card",
  })
  allowCreditCard: boolean;

  @Column({
    name: "allow_room_charge",
  })
  allowRoomCharge: boolean;

  @Column({
    name: "is_tax_exempt",
  })
  isTaxExempt: boolean;

  @Column({
    type: "jsonb",
  })
  rooms: string[];

  @Column({
    type: "point",
  })
  coordinates: string;

  @Column({
    name: "is_active",
  })
  isActive: boolean;

  @Column({
    name: "delivery_instructions",
  })
  deliveryInstructions: string;

  @Column({
    name: "is_web_enabled",
  })
  isWebEnabled: boolean;

  @Column({
    name: "has_cutlery",
  })
  hasCutlery: boolean;

  @Column({
    name: "menu_id",
  })
  menuId: number;

  @Column({
    name: "city_id",
  })
  cityId: number;

  @Column({
    name: "has_third_party_delivery",
  })
  hasThirdPartyDelivery: boolean;

  @Column({
    name: "has_delivery_fee",
  })
  hasDeliveryFee: boolean;

  @Column({
    name: "enable_automatic_tip",
    default: false,
  })
  enableAutomaticTip: boolean;

  @Column({
    name: "number_of_available_rooms",
  })
  number_of_available_rooms: number;
}
