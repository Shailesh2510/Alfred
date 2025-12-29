import { AssignedHotel } from '../interfaces/assigned-hotel.interface';

export class AssignedHotelVM {
  constructor(private readonly data: any) {}

  build(): AssignedHotel {
    return {
      hotelId: this.data.hotelId,
      hotelWebCode: this.data.hotelWebCode,
      hotelName: this.data.hotelName,
      merchantId: this.data.merchantId,
      menuId: this.data.menuId,
      isActive: this.data.isActive,
      associatedMealPeriods: this.data.associatedMealPeriods.map(mp => ({
        mealPeriodId: mp.mealPeriodId,
        mealPeriodName: mp.mealPeriodName,
        isActive: mp.isActive
      }))
    };
  }
}