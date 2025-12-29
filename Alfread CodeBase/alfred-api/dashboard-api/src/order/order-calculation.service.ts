import { OrderCalculation } from "database/entities/order.entity";
import {
  AmountType,
  IOrderCalculationVoucher,
  calculateTotalNet,
  getDecimalValue,
  getVoucherAmountOwedByHotel,
} from "./calculation";
import { calculateTaxAmount } from "./calculation";
import { calculateGrandTotal } from "./calculation";
import { calculateHotelTotalNet } from "./calculation";
import { calculateHotelTax } from "./calculation";
import { calculateHotelGrandTotal } from "./calculation";
import { PaymentType } from "./calculation";
import { calculateTotalGross } from "./calculation";
import { IOrderItem, calculateReceiptAmount } from "./calculation";
import Decimal from "decimal.js-light";
import { HttpException, HttpStatus } from "@nestjs/common";
import { calculateDeliveryFee, getDeliveryFee } from "../../helpers";
import { VoucherProgramType } from "database/entities/voucher_program.entity";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

export class OrderCalculationService {
  calculate(
    items: IOrderItem[],
    tip: number = 0,
    isTaxExempt: boolean = false,
    taxRate: number,
    vouchers: {
      orderVoucher: IOrderCalculationVoucher;
      prefixeVouchers: IOrderCalculationVoucher[];
    },
    paymentType: PaymentType,
    hasDeliveryFee: boolean,
    shipdayDeliveryFee: number,
    relayCanDeliverToThisAddress: boolean,
    isInHouseDelivery: boolean
  ) {
    console.log("Calculate-items: ", JSON.stringify(items));
    console.log("Calculate-tip: ", tip);
    console.log("Calculate-isTaxExempt: ", isTaxExempt);
    console.log("Calculate-taxRate: ", taxRate);
    console.log("Calculate-hasDeliveryFee", hasDeliveryFee);
    console.log(
      "Calculate-vouchers.orderVoucher: ",
      JSON.stringify(vouchers?.orderVoucher)
    );
    console.log(
      "Calculate-vouchers.prefixeVouchers: ",
      vouchers?.prefixeVouchers
    );
    console.log("Calculate-paymentType: ", paymentType);
    if (!taxRate) {
      throw new HttpException(
        `Merchant tax rate missing`,
        HttpStatus.BAD_REQUEST
      );
    }
    const orderItems = items;
    const receiptAmount = calculateReceiptAmount(orderItems, []);
    const { totalNet, discountVoucherValue } = calculateTotalNet({
      receiptAmount,
      voucher: vouchers.orderVoucher,
    });
    const taxAmount = calculateTaxAmount({
      amount:
        vouchers?.orderVoucher?.amountType == AmountType.PERCENTAGE
          ? totalNet
          : receiptAmount,
      isTaxExempt,
      taxRate,
    });
    const totalGross = calculateTotalGross({
      totalNet,
      taxAmount,
    });
    const { grandTotal, perDiemVoucherValue } = calculateGrandTotal({
      tip,
      deliveryFee: calculateDeliveryFee(
        hasDeliveryFee,
        relayCanDeliverToThisAddress,
        isInHouseDelivery,
        shipdayDeliveryFee
      ),
      totalGross,
      voucher: vouchers.orderVoucher,
    });
    const voucherPrice = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal,
      isTaxExempt,
      paymentType,
      receiptAmount,
      taxRate,
      tip,
      totalNet,
      vouchers,
    });
    const refundAmount = 0;
    const hotelTotalNet = calculateHotelTotalNet({
      discount: null,
      grandTotal,
      isTaxExempt,
      paymentType,
      receiptAmount,
      taxRate,
      tip,
      totalNet,
      vouchers,
    });
    const hotelTaxAmount = calculateHotelTax({
      hotelTotalNet,
      isTaxExempt,
      taxRate,
    });
    const hotelGrandTotal = calculateHotelGrandTotal(
      hotelTotalNet,
      taxAmount,
      new Decimal(tip),
      paymentType,
      getDeliveryFee(hasDeliveryFee, shipdayDeliveryFee)
    );
    const hotelTotalGross = hotelGrandTotal;

    const orderCalculation = new OrderCalculation.Builder()
      .setReceiptAmount(receiptAmount.toNumber())
      .setTotalNet(totalNet.toNumber())
      .setTaxAmount(taxAmount.toNumber())
      .setTotalGross(totalGross.toNumber())
      .setGrandTotal(grandTotal.toNumber())
      .setVoucherPrice(voucherPrice.toNumber())
      .setRefundAmount(refundAmount)
      .setHotelTotalNet(hotelTotalNet.toNumber())
      .setHotelTaxAmount(hotelTaxAmount.toNumber())
      .setHotelTotalGross(hotelTotalGross.toNumber())
      .setHotelGrandTotal(hotelGrandTotal.toNumber())
      .setTip(getDecimalValue(tip).toNumber())
      .setDeliveryFee(
        getDecimalValue(
          getDeliveryFee(hasDeliveryFee, shipdayDeliveryFee)
        ).toNumber()
      )
      .build();

    return {
      orderCalculation,
      perDiemVoucherValue,
      discountVoucherValue,
    };
  }
}
