import { Item, ItemCategory, ItemModifier } from '../entities/item.entity';
import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { Modifier } from '../entities/modifier.entity';
import { ModifierOption } from '../entities/modifier_option.entity';

export class seedItems1675944727937 implements MigrationInterface {

  async insertItems(queryRunner: QueryRunner, categories, items, merchantId) {
    const itemsToInsert = items.map((item, idx) => {
      return {
        id: idx + 1,
        version: 1,
        merchantId,
        name: item.name,
        tags: item.tags,
        description: item.description,
        price: item.price,
        promoPrice: item.promoPrice,
        imageUrl: item.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    });

    const savedItems = await queryRunner.manager.getRepository(Item).save(itemsToInsert);
    console.log({
      savedItems
    })
    const itemCategoriesToInsert = savedItems.map((item) => {
      console.log({
        item
      })
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        categoryId: category.id,
        itemId: item.id,
        merchantId: item.merchantId
      }
    })

    await queryRunner.manager.getRepository(ItemCategory).save(itemCategoriesToInsert);
    return savedItems;
  }

  async insertModifiers(queryRunner: QueryRunner, merchantId) {
    const modifiers = await queryRunner.manager.getRepository(Modifier).save(this.getModifiers(merchantId));
    const modifierOne = modifiers[0]
    const modifierTwo = modifiers[0]

    await this.insertModifierOptions(queryRunner, merchantId, modifierOne.id)
    await this.insertModifierOptions(queryRunner, merchantId, modifierTwo.id)

    return modifiers;
  }

  async insertModifierOptions(queryRunner: QueryRunner, merchantId, modifierId) {
    await queryRunner.manager.getRepository(ModifierOption).save(this.getModifierOptions(merchantId, modifierId));
  }

  async insertItemModifiers(queryRunner: QueryRunner, itemModifiers) {
    await queryRunner.manager.getRepository(ItemModifier).save(itemModifiers);
  }

  getModifiers(merchantId) {
    return [
      {
        merchantId,
        name: "Extra Cheese",
        createdAt: "2022-03-01T14:30:00.000Z",
        updatedAt: "2022-03-02T10:45:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "No Onions",
        createdAt: "2022-03-03T08:15:00.000Z",
        updatedAt: "2022-03-04T13:20:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Extra Bacon",
        createdAt: "2022-03-05T16:40:00.000Z",
        updatedAt: "2022-03-06T11:10:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Gluten-Free",
        createdAt: "2022-03-01T14:30:00.000Z",
        updatedAt: "2022-03-02T10:45:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Extra Sauce",
        createdAt: "2022-03-03T08:15:00.000Z",
        updatedAt: "2022-03-04T13:20:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "No Olives",
        createdAt: "2022-03-05T16:40:00.000Z",
        updatedAt: "2022-03-06T11:10:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Extra Hot",
        createdAt: "2022-03-01T14:30:00.000Z",
        updatedAt: "2022-03-02T10:45:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "No Tomatoes",
        createdAt: "2022-03-03T08:15:00.000Z",
        updatedAt: "2022-03-04T13:20:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Double Meat",
        createdAt: "2022-03-05T16:40:00.000Z",
        updatedAt: "2022-03-06T11:10:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Extra Spicy",
        createdAt: "2022-03-08T13:00:00.000Z",
        updatedAt: "2022-03-09T09:15:00.000Z",
        deletedAt: null
      },
      {
        merchantId,
        name: "Add Bacon",
        createdAt: "2022-03-01T14:30:00.000Z",
        updatedAt: "2022-03-02T10:45:00.000Z",
        deletedAt: null
      }
    ];
  }

  getModifierOptions(merchantId, modifierId) {
    return [
      {
        merchantId,
        modifierId,
        name: "With Onions"
      },
      {
        merchantId,
        modifierId,
        name: "Without Onions"
      },
      {
        merchantId,
        modifierId,
        name: "Double"
      },
      {
        merchantId,
        modifierId,
        name: "Regular"
      },
      {
        merchantId,
        modifierId,
        name: "Large"
      },
      {
        merchantId,
        modifierId,
        name: "Single"
      },
      {
        merchantId,
        modifierId,
        name: "Plant-Based"
      },
      {
        merchantId,
        modifierId,
        name: "Vegetarian"
      },
    ]
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const breakfastCategories = await queryRunner.manager.query(
      `SELECT c.id FROM categories c inner join meal_period mp on mp.id = c.meal_period_id WHERE mp.name = 'Breakfast'`
    );
    const brunchCategories = await queryRunner.manager.query(
      `SELECT c.id FROM categories c inner join meal_period mp on mp.id = c.meal_period_id WHERE mp.name = 'Brunch'`
    );
    const lunchCategories = await queryRunner.manager.query(
      `SELECT c.id FROM categories c inner join meal_period mp on mp.id = c.meal_period_id WHERE mp.name = 'Lunch'`
    );
    const dinnerCategories = await queryRunner.manager.query(
      `SELECT c.id FROM categories c inner join meal_period mp on mp.id = c.meal_period_id WHERE mp.name = 'Dinner'`
    );
    console.log({
      breakfastCategories
    })

    const breakfastItems = [
      {
        name: 'Pancakes',
        tags: ['breakfast', 'sweet'],
        description: 'Fluffy pancakes served with maple syrup and butter',
        price: 5.99,
        promoPrice: 4.99,
        imageUrl: 'https://example.com/pancakes.jpg',
      },
      {
        name: 'Eggs Benedict',
        tags: ['breakfast', 'savory'],
        description: 'English muffin topped with Canadian bacon, poached eggs, and hollandaise sauce',
        price: 7.99,
        promoPrice: null,
        imageUrl: 'https://example.com/eggs_benedict.jpg',
      },
      {
        name: 'French Toast',
        tags: ['breakfast', 'sweet'],
        description: 'Thick slices of bread dipped in egg batter and served with powdered sugar and fruit',
        price: 6.99,
        promoPrice: 6.59,
        imageUrl: 'https://example.com/french_toast.jpg',
      },
      {
        name: 'Omelette',
        tags: ['breakfast', 'savory'],
        description: 'Fluffy omelette filled with cheese, mushrooms, onions, and peppers',
        price: 8.99,
        promoPrice: 7.99,
        imageUrl: 'https://example.com/omelette.jpg',
      },
    ];

    const brunchItems = [
      {
        "name": "Avocado Toast",
        "tags": ["brunch", "vegetarian", "healthy"],
        "description": "Toasted bread topped with mashed avocado, sliced tomatoes, and a sprinkle of salt and pepper",
        "price": 6.99,
        "promo_price": null,
        "image_url": "https://example.com/avocado_toast.jpg"
      },
      {
        "name": "Mimosa",
        "tags": ["brunch", "alcoholic", "refreshing"],
        "description": "Champagne mixed with orange juice, served in a flute",
        "price": 5.99,
        "promo_price": null,
        "image_url": "https://example.com/mimosa.jpg"
      },
      {
        "name": "Eggs Florentine",
        "tags": ["brunch", "savory"],
        "description": "English muffin topped with sautéed spinach, poached eggs, and hollandaise sauce",
        "price": 9.99,
        "promo_price": 8.99,
        "image_url": "https://example.com/eggs_florentine.jpg"
      },
      {
        "name": "Breakfast Burrito",
        "tags": ["brunch", "spicy", "hearty"],
        "description": "A tortilla filled with scrambled eggs, cheese, bacon, and spicy salsa",
        "price": 8.99,
        "promo_price": null,
        "image_url": "https://example.com/breakfast_burrito.jpg"
      }
    ];

    const lunchItems = [
      {
        "name": "Caesar Salad",
        "tags": ["lunch", "vegetarian", "healthy"],
        "description": "Romaine lettuce, croutons, parmesan cheese, and a creamy Caesar dressing",
        "price": 8.99,
        "promo_price": null,
        "image_url": "https://example.com/caesar_salad.jpg"
      },
      {
        "name": "Turkey Club Sandwich",
        "tags": ["lunch", "hearty"],
        "description": "Sliced turkey breast, bacon, lettuce, tomato, and mayo on toasted bread",
        "price": 10.99,
        "promo_price": 9.99,
        "image_url": "https://example.com/turkey_club_sandwich.jpg"
      },
      {
        "name": "Margherita Pizza",
        "tags": ["lunch", "vegetarian", "italian"],
        "description": "Pizza topped with tomato sauce, mozzarella cheese, and fresh basil",
        "price": 12.99,
        "promo_price": null,
        "image_url": "https://example.com/margherita_pizza.jpg"
      },
      {
        "name": "Fish and Chips",
        "tags": ["lunch", "seafood"],
        "description": "Battered and fried cod served with french fries and tartar sauce",
        "price": 13.99,
        "promo_price": null,
        "image_url": "https://example.com/fish_and_chips.jpg"
      }
    ];

    const dinnerItems = [
      {
        "name": "Grilled Steak",
        "tags": ["dinner", "meat"],
        "description": "Juicy grilled steak with a side of garlic mashed potatoes and roasted vegetables",
        "price": 24.99,
        "promo_price": null,
        "image_url": "https://example.com/grilled_steak.jpg"
      },
      {
        "name": "Lobster Linguine",
        "tags": ["dinner", "seafood"],
        "description": "Lobster meat tossed with linguine in a garlic and white wine sauce",
        "price": 29.99,
        "promo_price": null,
        "image_url": "https://example.com/lobster_linguine.jpg"
      },
      {
        "name": "Roasted Chicken",
        "tags": ["dinner", "hearty"],
        "description": "Oven-roasted chicken with a side of mashed sweet potatoes and green beans",
        "price": 19.99,
        "promo_price": null,
        "image_url": "https://example.com/roasted_chicken.jpg"
      },
      {
        "name": "Vegetable Stir Fry",
        "tags": ["dinner", "vegetarian", "healthy"],
        "description": "Stir fried vegetables with tofu and brown rice",
        "price": 16.99,
        "promo_price": 14.99,
        "image_url": "https://example.com/vegetable_stir_fry.jpg"
      }
    ];

    const merchants = await queryRunner.manager.query(
      `select id from merchants order by id limit 1`
    );

    console.log({
      merchants
    })
    const breakfastItemsSaved = await this.insertItems(queryRunner, breakfastCategories, breakfastItems, merchants[0].id);
    await this.insertItems(queryRunner, brunchCategories, brunchItems, merchants[0].id);
    await this.insertItems(queryRunner, lunchCategories, lunchItems, merchants[0].id);
    await this.insertItems(queryRunner, dinnerCategories, dinnerItems, merchants[0].id);

    const modifiers = await this.insertModifiers(queryRunner, merchants[0].id)

    const itemModifiers = [];
    breakfastItemsSaved.forEach((item) => {
      modifiers.forEach((modifier) => {
        itemModifiers.push({
          itemId: item.id,
          modifierId: modifier.id,
          merchantId: merchants[0].id
        })
      })
    })

    await this.insertItemModifiers(queryRunner, itemModifiers)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM modifier_options where id > 0 ');
    await queryRunner.manager.query('DELETE FROM item_modifier where id > 0 ');
    await queryRunner.manager.query('DELETE FROM item_category where id > 0 ');
    await queryRunner.manager.query('DELETE FROM items where id > 0 ');
    await queryRunner.manager.query('DELETE FROM modifiers where id > 0 ');
  }
}
