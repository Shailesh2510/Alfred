import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Hotel } from "./hotel.entity";

@Entity("hotel_arrivals")
export class HotelArrivals {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "room_number",
  })
  roomNumber: string;

  @Column({
    name: "reservation_status",
  })
  reservationStatus: string;

  @Column({
    name: "first_name",
  })
  firstName: string;

  @Column({
    name: "last_name",
  })
  lastName: string;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP(6)",
    name: "arrival_date",
  })
  arrivalDate: Date;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP(6)",
    name: "departure_date",
  })
  departureDate: Date;

  @Column({
    name: "special_requests",
  })
  specialRequests?: string;

  @Column({
    name: "phone_number",
  })
  phoneNumber: string;

  @Column({
    name: "email",
  })
  email?: string;

  @Column({
    name: "comments",
  })
  comments?: string;

  @Column({
    name: "country_code",
  })
  countryCode?: string;

  @Column({
    name: "membership_id",
  })
  membershipId?: string;

  @Column({
    name: "membership_level",
  })
  membershipLevel?: string;

  @Column({
    name: "membership_type",
  })
  membershipType?: string;

  @Column({
    name: "hotel_id",
  })
  hotelId: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.id)
  @JoinColumn({ name: "hotel_id", referencedColumnName: "id" })
  hotel: Hotel;
}
