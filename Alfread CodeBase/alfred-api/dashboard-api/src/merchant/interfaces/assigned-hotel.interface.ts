export interface AssociatedMealPeriod {
  mealPeriodId: number;
  mealPeriodName: string;
  isActive: boolean;
}

export interface AssignedHotel {
  menuId: number;
  hotelId: number;
  hotelWebCode: string;
  hotelName: string;
  merchantId: number;
  isActive: boolean;
  associatedMealPeriods: AssociatedMealPeriod[];
}