import { MigrationInterface, QueryRunner } from 'typeorm';

export class createMenuTables1672141496970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table meal_period (
        id serial,
        version int,
        merchant_id int,
        name varchar(255) not null unique,
        start_hour time not null,
        end_hour time not null,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        foreign key (merchant_id) references merchants(id),
        primary key (id)
      );
    `);
    await queryRunner.query(`
      create table categories (
        id serial,
        version int,
        merchant_id int not null,
        meal_period_id int,
        name varchar(255) not null,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id),
        foreign key (merchant_id) references merchants(id),
        foreign key (meal_period_id) references meal_period(id)
      );
    `);
    await queryRunner.query(`
      create table items (
        id serial,
        version int,
        merchant_id int not null,
        name varchar(255) not null,
        tags text,
        description text,
        price numeric(10,5),
        promo_price numeric(10,5),
        image_url varchar(255),
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id),
        foreign key (merchant_id) references merchants(id)
      );
    `);
    await queryRunner.query(`
      create table item_category (
        id serial,
        merchant_id int not null,
        item_id int,
        category_id int,
        primary key (id),
        foreign key (merchant_id) references merchants(id),
        foreign key (item_id) references items(id),
        foreign key (category_id) references categories(id)
      );
    `);
    await queryRunner.query(`
      create table modifiers (
        id serial,
        version int,
        merchant_id int not null,
        name varchar(255) not null,
        required_options bool default false,
        multiple_options bool default false,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id),
        foreign key (merchant_id) references merchants(id)
      );
    `);
    await queryRunner.query(`
      create table modifier_options (
        id serial,
        merchant_id int not null,
        modifier_id int,
        name varchar(255) not null,
        price numeric(10,5),
        primary key (id),
        foreign key (merchant_id) references merchants(id),
        foreign key (modifier_id) references modifiers(id)
      );
    `);
    await queryRunner.query(`
      create table item_modifier (
        id serial,
        merchant_id int,
        item_id int,
        modifier_id int,
        primary key (id),
        foreign key (merchant_id) references merchants(id),
        foreign key (item_id) references items(id),
        foreign key (modifier_id) references modifiers(id)
      );
    `);
    await queryRunner.query(`
      create table menus (
        id serial,
        version int,
        name varchar(255) not null,
        created_at timestamptz default CURRENT_TIMESTAMP(6),
        updated_at timestamptz default CURRENT_TIMESTAMP(6),
        deleted_at timestamptz,
        primary key (id)
      );
    `);
    await queryRunner.query(`
      create table menu_category (
        id serial,
        menu_id int,
        meal_period_id int,
        name varchar(255),
        primary key(id),
        foreign key (menu_id) references menus(id),
        foreign key (meal_period_id) references meal_period(id)
      );
    `);
    await queryRunner.query(`
      create table menu_item (
        id serial,
        item_id int,
        menu_id int,
        menu_category_id int,
        price numeric(10,5),
        new_price numeric(10,5),
        primary key(id),
        constraint cstx_item_menu_category UNIQUE (item_id, menu_id, menu_category_id),
        foreign key (item_id) references items(id),
        foreign key (menu_id) references menus(id),
        foreign key (menu_category_id) references menu_category(id)
      );
    `);
    await queryRunner.query(`
      create table menu_hotel (
        id serial,
        menu_id int,
        hotel_id int,
        primary key (id),
        constraint cstx_menu_hotel UNIQUE (menu_id, hotel_id),
        foreign key (menu_id) references menus(id),
        foreign key (hotel_id) references hotels(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists menu_hotel;`);
    await queryRunner.query(`drop table if exists menu_item;`);
    await queryRunner.query(`drop table if exists menu_category`);
    await queryRunner.query(`drop table if exists menus;`);
    await queryRunner.query(`drop table if exists item_modifier;`);
    await queryRunner.query(`drop table if exists modifier_options;`);
    await queryRunner.query(`drop table if exists modifiers;`);
    await queryRunner.query(`drop table if exists item_category;`);
    await queryRunner.query(`drop table if exists items;`);
    await queryRunner.query(`drop table if exists categories;`);
    await queryRunner.query(`drop table if exists meal_period`);
  }
}
