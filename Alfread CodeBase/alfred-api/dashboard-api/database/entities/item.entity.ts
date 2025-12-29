import { DECIMAL_COLUMN } from "helpers";
import { AuditEntity } from "./audit.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { plainToClass } from "class-transformer";

@Entity("items")
export class Item extends AuditEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column()
  tags: string;

  @Column()
  description: string;

  @Column(DECIMAL_COLUMN)
  price: number;

  @Column(DECIMAL_COLUMN, {
    name: "promo_price",
  })
  promoPrice: number;

  @Column({
    name: "image_url",
  })
  imageUrl: string;

  @Column({
    name: "order_quantity",
    default: 1,
  })
  orderQuantity: number;

  toEntity<T>(input: T | T[]) {
    return plainToClass(Item, input, {
      excludeExtraneousValues: true,
    });
  }
}

@Entity("item_category")
export class ItemCategory {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column({
    name: "item_id",
  })
  itemId: number;

  @Column({
    name: "category_id",
  })
  categoryId: number;
}

@Entity("item_modifier")
export class ItemModifier {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    name: "merchant_id",
  })
  merchantId: number;

  @Column({
    name: "item_id",
  })
  itemId: number;

  @Column({
    name: "modifier_id",
  })
  modifierId: number;
}
