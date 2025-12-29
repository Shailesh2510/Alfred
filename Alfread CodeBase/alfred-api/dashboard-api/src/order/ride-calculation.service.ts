import { OrderCalculation } from "database/entities/order.entity";
import {
  IOrderCalculationVoucher,
  calculateTotalNet,
  getDecimalValue,
  getVoucherAmountOwedByHotel,
} from "./calculation";
import { calculateGrandTotal } from "./calculation";
import { calculateHotelTotalNet } from "./calculation";
import { calculateHotelTax } from "./calculation";
import { calculateHotelGrandTotal } from "./calculation";
import { PaymentType } from "./calculation";
import Decimal from "decimal.js-light";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

export class RideCalculationService {
  calculate(
    rideGrandTotal: number,
    tip: number,
    vouchers: {
      orderVoucher: IOrderCalculationVoucher;
      prefixeVouchers: IOrderCalculationVoucher[];
    },
    paymentType: PaymentType
  ) {
    console.log("Calculate-rideGrandTotal: ", rideGrandTotal);
    console.log(
      "Calculate-vouchers.orderVoucher: ",
      JSON.stringify(vouchers?.orderVoucher)
    );
    console.log(
      "Calculate-vouchers.prefixeVouchers: ",
      vouchers?.prefixeVouchers
    );
    console.log("Calculate-paymentType: ", paymentType);

    const { totalNet, discountVoucherValue } = calculateTotalNet({
      receiptAmount: getDecimalValue(rideGrandTotal),
      voucher: vouchers.orderVoucher,
    });

    const { grandTotal, perDiemVoucherValue } = calculateGrandTotal({
      tip: 0,
      deliveryFee: 0,
      totalGross: totalNet,
      voucher: vouchers.orderVoucher,
    });
    const voucherPrice = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal,
      isTaxExempt: true,
      paymentType,
      receiptAmount: getDecimalValue(rideGrandTotal),
      taxRate: 0,
      tip: 0,
      totalNet,
      vouchers,
    });
    const refundAmount = 0;
    const hotelTotalNet = calculateHotelTotalNet({
      discount: null,
      grandTotal,
      isTaxExempt: true,
      paymentType,
      receiptAmount: getDecimalValue(rideGrandTotal),
      taxRate: 0,
      tip: 0,
      totalNet,
      vouchers,
    });
    const hotelTaxAmount = calculateHotelTax({
      hotelTotalNet,
      isTaxExempt: true,
      taxRate: 0,
    });
    const hotelGrandTotal = calculateHotelGrandTotal(
      hotelTotalNet,
      getDecimalValue(0),
      getDecimalValue(0),
      paymentType,
      0
    );
    const hotelTotalGross = hotelGrandTotal;

    const orderCalculation = new OrderCalculation.Builder()
      .setReceiptAmount(rideGrandTotal)
      .setTotalNet(totalNet.toNumber())
      .setTaxAmount(0)
      .setTotalGross(rideGrandTotal)
      .setGrandTotal(grandTotal.toNumber())
      .setVoucherPrice(voucherPrice.toNumber())
      .setRefundAmount(refundAmount)
      .setHotelTotalNet(hotelTotalNet.toNumber())
      .setHotelTaxAmount(hotelTaxAmount.toNumber())
      .setHotelTotalGross(hotelTotalGross.toNumber())
      .setHotelGrandTotal(hotelGrandTotal.toNumber())
      .setTip(getDecimalValue(tip).toNumber())
      .setDeliveryFee(0)
      .build();

    return {
      orderCalculation,
      perDiemVoucherValue,
      discountVoucherValue,
    };
  }
}
