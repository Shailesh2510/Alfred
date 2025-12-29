aws cognito-idp admin-set-user-password --user-pool-id us-east-1_7oCdBm4Mk --username demo+hotel@getalfredapp.com --password DemoAccount009!! --permanent

<!-- Hotel User Process -->
1. Create a Hotel /tenant/hotel
2. Take hotel ID
3. Create a user /tenant/user with hotelId, remove merchantId
4. User should confirm and change password

<!-- Merchant User Process -->
1. Create a Merchant /tenant/merchant
2. Take Merchant ID
3. Create a user /tenant/user with merchantId, remove hotelId
4. User should confirm and change password

<!-- Add merchant meal periods -->
1. Create a meal period for merchant /tenant/meal_period (create as many as you need)

<!-- Assign merchant to hotel for whatever meal period -->
1. Assign here /tenant/hotel/{hotel_id}/assign/merchant/{merchant_id}
2. Add mealPeriodIds on payload from previous meal periods that you have created


<!-- Create a menu -->
1. Create a menu for the hotel on /tenant/menu (pass the hotelId - only one is allowed)


<!-- Create items for merchants and menu items for hotels - this is the items that they offer -->
1. Create item on /tenant/item/merchant/{merchant_id}
2. Create menu category for hotel /tenant/menu_category/hotel/{hotel_id}
3. Create menu items for hotel /tenant/menu_item/batch/hotel/{hotel_id} (here you specify item ids (that merchant has), menu id and menu category id which is what we created for the hotel earlier which has the meal period - this is the link between hotel and merchant)
4. Publish the menu for the hotel 
(menu is available on s3 and can be access on this url: https://dev-alfredmenu.s3.amazonaws.com/alfredmenu-{your-hotel-uuid-here}-menu) - You can find the hotel id on this url https://dev-alfredmenu.s3.amazonaws.com/hotels, if the hotel id is not there you can try regenerate-hotel-list endpoint /tenant/hotel/regenerate-hotel-list


<!-- Create Order -->
1. Create order with payload
```
{
  "clientName": "John Doe",
  "clientNumber": "1234567890",
  "orderType": "ROOM_CHARGE",
  "mealPeriodId": 20,
  "hotelId": 25,
  "tip": "10",
  "items": [
    {
      "id": 60, //this should be the item id not menu item id
      "quantity": 2
    }
  ]
}
```







{
  "clientName": "John Doe - Another one",
  "clientNumber": "1234567890",
  "orderType": "ROOM_CHARGE",
  "mealPeriodId": 20,
  "hotelId": 25,
  "tip": "10",
  "items": [
    {
      "id": 60,
      "quantity": 2,
      "modifiers": [
        {
          "id": 41,
          "options": [
            {
              "id": 60,
              "quantity": 1
            }
          ]
        }
      ]
    },
    {
      "id": 63,
      "quantity": 2,
      "modifiers": [
        {
          "id": 42,
          "options": [
            {
              "id": 63,
              "quantity": 1
            },
            {
              "id": 64,
              "quantity": 1
            }
          ]
        }
      ]
    }
  ]
}