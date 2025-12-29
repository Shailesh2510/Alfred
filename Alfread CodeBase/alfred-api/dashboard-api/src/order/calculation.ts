import { RELAY_DELIVERY_FEE } from "../../helpers";
import {
  VoucherProgramPayer,
  VoucherProgramType,
} from "../../database/entities/voucher_program.entity";
import { Decimal } from "decimal.js-light";
import { HttpException, HttpStatus } from "@nestjs/common";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

export enum AmountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum PaymentType {
  ROOM_CHARGE = "ROOM_CHARGE",
  CREDIT_CARD = "CREDIT_CARD",
  PAY_LATER = "PAY_LATER",
}

export enum PriceMeasurementType {
  PERCENTAGE,
  FIXED,
}

export interface IOrderModifierOption {
  id: number;
  price: number;
  quantity: number;
}

export interface IOrderModifier {
  id: number;
  options: IOrderModifierOption[];
}

export interface IOrderItem {
  id: number;
  price: number;
  modifiers?: IOrderModifier[];
  quantity: number;
  codeId?: number;
  ruleId?: number;
  menuCategoryId?: number;
}

export interface IOrderCustomItem {
  price: number;
  quantity: number;
}

export interface IOrderCalculationDiscount {
  value: number;
  valueUsed: number;
  type: PriceMeasurementType;
}

export interface IVoucherProgramRule {
  id: number;
  meal_period_id: number;
  quantity: number;
  max_price: number;
  menu_category_ids: number[];
}

export interface IOrderCalculationVoucher {
  id: number;
  voucherProgramType: VoucherProgramType;
  totalAmount: number;
  amountUsed?: number;
  amountType: AmountType;
  payer: VoucherProgramPayer;
  payerPercentage: number;
  rules?: IVoucherProgramRule[];
}

export interface IOrderCalculationInput {
  items: IOrderItem[];
  customItems?: IOrderCustomItem[];
  tip: number;
  deliveryFee: number;
  discount?: IOrderCalculationDiscount;
  vouchers?: IOrderCalculationVoucher[];
  taxRate?: number;
  isTaxExempt?: boolean;
  paymentType: PaymentType;
}

export interface IOrderCalculationOutput {
  receiptAmount: number;
  taxAmount: number;
  totalNet: number;
  totalGross: number;
  grandTotal: number;
  hotelTotalNet: number;
  hotelTax: number;
  hotelGrandTotal: number;
  totalVoucherPrice: number;
  tip: number;
  deliveryFee: number;
  discount: number;
}

export interface IDefaultOrderValue {
  grandTotal: number;
  totalVoucherPrice: number;
  vouchers: IOrderCalculationVoucher[];
  hotelGrandTotal: number;
  taxRate: number;
}

export interface IOrderCalculation {
  calculate(input: IOrderCalculationInput): IOrderCalculationOutput;
}

export const validateItemData = (item: IOrderItem) => {
  const { id, price, quantity } = item;
  const decimalPrice = new Decimal(price);
  if (!id || !decimalPrice || !quantity) {
    throw new Error("Invalid order item");
  }
};

export const validateCustomItemData = (item: IOrderCustomItem) => {
  const { price, quantity } = item;
  const decimalPrice = new Decimal(price);

  if (decimalPrice && quantity) {
    return;
  }
  throw new Error("Invalid custom order item");
};

export const validateVoucherPayload = (
  items: IOrderItem[],
  vouchers: IOrderCalculationVoucher[]
) => {
  if (!vouchers || Object.keys(vouchers).length === 0) {
    return;
  }
  let cnt = 0;
  items.forEach((item: IOrderItem) => {
    if (item.codeId || item.ruleId) {
      cnt++;
    }
  });
  const prefixeVouchers = vouchers.filter((v: IOrderCalculationVoucher) => {
    if (v.voucherProgramType == null) {
      throw new Error("Voucher type cannot be null");
    }
    return v.voucherProgramType === VoucherProgramType.PRE_FIXE;
  });
  if (prefixeVouchers.length > cnt) {
    throw new Error("Cannot have less items than prefixe vouchers applied");
  }
};

export const getTotalVoucherPrice = (
  amount: Decimal,
  vouchers: IOrderCalculationVoucher[]
) => {
  let totalVoucherPrice = new Decimal(0);
  if (vouchers.length > 0) {
    if (vouchers.length == 1) {
      if (vouchers[0].voucherProgramType === VoucherProgramType.DISCOUNT) {
        totalVoucherPrice = getVoucherValue(amount, vouchers[0]);
      }
      if (vouchers[0].voucherProgramType === VoucherProgramType.PER_DIEM) {
        if (vouchers[0].amountType !== AmountType.FIXED) {
          throw new Error("Perdiem supports only FIXED type");
        }
        totalVoucherPrice = getVoucherValue(amount, vouchers[0]);
        if (totalVoucherPrice.comparedTo(amount) >= 0) {
          totalVoucherPrice = amount;
        }
      }
      if (vouchers[0].voucherProgramType === VoucherProgramType.PRE_FIXE) {
        if (vouchers[0].amountType !== AmountType.FIXED) {
          throw new Error("Prefixe supports only FIXED type");
        }
        totalVoucherPrice = totalVoucherPrice.add(vouchers[0].totalAmount);
      }
    } else {
      vouchers.forEach((voucher: IOrderCalculationVoucher) => {
        if (voucher.voucherProgramType !== VoucherProgramType.PRE_FIXE) {
          throw new Error("Multiple vouchers are allowed for PREFIXE only");
        }
        if (voucher.amountType !== AmountType.FIXED) {
          throw new Error("Prefixe supports only FIXED type");
        }
        totalVoucherPrice = totalVoucherPrice.add(voucher.totalAmount);
      });
    }
  }
  return totalVoucherPrice;
};

export const getPerdiemVoucherValue = (voucher: IOrderCalculationVoucher) => {
  if (voucher.amountType !== AmountType.FIXED) {
    throw new Error("Perdiem supports only FIXED type");
  }
  try {
    const voucherValue = new Decimal(voucher.totalAmount);
    const voucherValueUsed = new Decimal(voucher.amountUsed ?? 0);
    return voucherValue.sub(voucherValueUsed);
  } catch (e) {
    console.log(`error@getPerdiemVoucherValue: `, e);
    throw new Error("Attributes missing for perdiem voucher value: ");
  }
};

export const calculateBasicTotalPrice = (input: IOrderItem) => {
  if (
    (input.codeId && input.ruleId == null) ||
    (input.ruleId && input.codeId == null)
  ) {
    throw new Error(`Inconsistency between rule id and code id ${input}`);
  }

  if (input.codeId && input.ruleId) {
    return new Decimal(0);
  }

  return new Decimal(input.price ?? 0).mul(input.quantity ?? 0);
};

export const validatePrefixePayload = (
  items: IOrderItem[],
  vouchers: IOrderCalculationVoucher[]
) => {
  if (
    vouchers.length == 1 &&
    vouchers[0].voucherProgramType !== VoucherProgramType.PRE_FIXE
  ) {
    return;
  }
  const itemsWithCodes = {};
  items.forEach((item: IOrderItem) => {
    if (item.codeId) {
      itemsWithCodes[item.codeId] = true;
      // item.price = new Decimal(0);
    }
  });

  if (Object.keys(itemsWithCodes).length == 0 && vouchers.length > 0) {
    throw new Error(
      "Prefixe inconsistency between input vouchers and item vouchers"
    );
  }
  if (
    Object.keys(itemsWithCodes).length > 0 &&
    Object.keys(itemsWithCodes).length !== vouchers.length
  ) {
    throw new Error(
      "Prefixe inconsistency between input vouchers and item vouchers"
    );
  }
};

export const calculateCustomItemsValue = (
  items: IOrderCustomItem[]
): Decimal => {
  let totalItemsPrice: Decimal = new Decimal(0.0);
  items.forEach((item: IOrderItem) => {
    validateCustomItemData(item);
    const totalItemPrice: Decimal = calculateBasicTotalPrice(item);
    totalItemsPrice = totalItemsPrice.add(totalItemPrice);
  });
  return totalItemsPrice;
};

export const calculateModifiersValue = (
  modifiers: IOrderModifier[],
  itemQuantity: number
): Decimal => {
  let totalOptionsPrice: Decimal = new Decimal(0.0);
  modifiers.forEach((modifier: IOrderModifier) => {
    modifier.options.forEach((option: IOrderModifierOption) => {
      const totalOptionPrice = calculateBasicTotalPrice(option);
      totalOptionsPrice = totalOptionsPrice.add(totalOptionPrice);
    });
  });
  return totalOptionsPrice.mul(itemQuantity);
};

export const calculateOrderItemsValue = (items: IOrderItem[]): Decimal => {
  let totalItemsPrice: Decimal = new Decimal(0.0);
  items.forEach((item: IOrderItem) => {
    validateItemData(item);
    const totalItemPrice: Decimal = calculateBasicTotalPrice(item);
    const totalModifiersPrice = calculateModifiersValue(
      item.modifiers,
      item.quantity
    );
    totalItemsPrice = totalItemsPrice.add(
      totalItemPrice.add(totalModifiersPrice)
    );
  });
  return totalItemsPrice;
};

export const calculateItemsValue = (
  items: IOrderItem[],
  customItems: IOrderCustomItem[]
): Decimal => {
  const totalItemsPrice: Decimal = calculateOrderItemsValue(items);
  const totalCustomItemsPrice: Decimal =
    customItems && customItems.length
      ? calculateCustomItemsValue(customItems)
      : new Decimal(0.0);

  return totalItemsPrice.add(totalCustomItemsPrice);
};

export const calculateReceiptAmount = (
  items: IOrderItem[],
  customItems: IOrderCustomItem[]
): Decimal => {
  return calculateItemsValue(items, customItems);
};

export const getDiscountValue = (
  amount: Decimal,
  discount: IOrderCalculationDiscount
): Decimal => {
  if (!discount) {
    return new Decimal(0);
  }
  const discountValue = new Decimal(discount.value);
  const discountValueUsed = new Decimal(discount.valueUsed);

  const value =
    discount.type === PriceMeasurementType.PERCENTAGE
      ? discountValue.div(new Decimal(100)).mul(amount).minus(discountValueUsed)
      : discountValue.minus(discountValueUsed);

  if (value.comparedTo(new Decimal(0)) < 0) {
    throw new Error("Discount value used greater than value");
  }

  return value.comparedTo(amount) >= 0 ? amount : value;
};

export const getVoucherValue = (
  amount: Decimal,
  voucher: IOrderCalculationVoucher
): Decimal => {
  const voucherValue =
    voucher?.amountType === AmountType.PERCENTAGE
      ? amount.mul(new Decimal(voucher.totalAmount)).div(new Decimal(100))
      : voucher?.voucherProgramType === VoucherProgramType.PER_DIEM
      ? getPerdiemVoucherValue(voucher)
      : new Decimal(voucher?.totalAmount ?? 0);

  if (
    voucher?.voucherProgramType === VoucherProgramType.DISCOUNT &&
    voucherValue.comparedTo(amount) > 0
  ) {
    return amount;
  }

  return voucherValue;
};

export interface ITaxAmountInput {
  amount: Decimal;
  taxRate: number;
  isTaxExempt: boolean;
}

export const calculateTaxAmount = (input: ITaxAmountInput) => {
  const { amount, taxRate, isTaxExempt } = input;
  return isTaxExempt
    ? new Decimal(0)
    : amount.mul(taxRate).div(new Decimal(100));
};

export interface ITotalNetInput {
  receiptAmount: Decimal;
  discount?: IOrderCalculationDiscount;
  voucher?: IOrderCalculationVoucher;
}

export const calculateTotalNet = (
  input: ITotalNetInput
): { totalNet: Decimal; discountVoucherValue: Decimal } => {
  const { receiptAmount, discount, voucher } = input;
  if (voucher && discount) {
    throw new Error("Cannot apply both voucher and discount to an order");
  }
  let discountValue: Decimal = discount
    ? getDiscountValue(receiptAmount, discount)
    : new Decimal(0);

  if (voucher?.amountType === AmountType.PERCENTAGE) {
    discountValue = getVoucherValue(receiptAmount, voucher);
  }
  const zeroAmount: Decimal = new Decimal(0);
  const totalNet = receiptAmount.sub(discountValue);

  return {
    totalNet: totalNet.comparedTo(zeroAmount) > 0 ? totalNet : zeroAmount,
    discountVoucherValue: discountValue,
  };
};

export interface ITotalGrossInput {
  totalNet: Decimal;
  taxAmount: Decimal;
}

export const calculateTotalGross = (input: ITotalGrossInput): Decimal => {
  const { totalNet, taxAmount } = input;
  return totalNet.add(taxAmount);
};

export interface IGrandTotalInput {
  totalGross: Decimal;
  voucher: IOrderCalculationVoucher;
  tip: number;
  deliveryFee: number;
}

export const calculateGrandTotal = (
  input: IGrandTotalInput
): {
  grandTotal: Decimal;
  perDiemVoucherValue: Decimal;
} => {
  const { totalGross, voucher, tip, deliveryFee } = input;
  let totalGrossWithDeliveryFee = totalGross.add(getDecimalValue(deliveryFee));
  let totalGrossWithDeliveryFeeWithTip = totalGrossWithDeliveryFee.add(
    getDecimalValue(tip)
  );
  let voucherValue =
    voucher && voucher.amountType === AmountType.FIXED
      ? getPerdiemVoucherValue(voucher)
      : new Decimal(0);

  if (voucherValue.comparedTo(totalGross) == 1) {
    if (voucherValue.comparedTo(totalGrossWithDeliveryFee) == 1) {
      if (voucherValue.comparedTo(totalGrossWithDeliveryFeeWithTip) == 1)
        voucherValue = totalGrossWithDeliveryFeeWithTip;
      else voucherValue = totalGrossWithDeliveryFee;
    }
  }
  let grandTotal = totalGrossWithDeliveryFee
    .sub(voucherValue)
    .add(getDecimalValue(tip));

  return {
    grandTotal:
      grandTotal.comparedTo(new Decimal(0)) <= 0 ? new Decimal(0) : grandTotal,
    perDiemVoucherValue: voucherValue,
  };
};

export const getDecimalValue = (val: number) => {
  return val ? new Decimal(val) : new Decimal(0);
};

export const getValueWithoutTax = (taxRate: number, value: Decimal) => {
  // TP / 1 + R
  const divisor: Decimal = new Decimal(1).add(
    new Decimal(taxRate).mul(new Decimal("0.01"))
  );
  return value.div(divisor);
};

export const getValueWithTax = (taxRate: number, value: Decimal) => {
  return value.add(value.mul(new Decimal(taxRate).mul(new Decimal("0.01"))));
};

export interface IHotelTotalNetInput {
  totalNet: Decimal;
  grandTotal: Decimal;
  tip: number;
  receiptAmount: Decimal;
  discount: IOrderCalculationDiscount;
  vouchers: {
    orderVoucher: IOrderCalculationVoucher;
    prefixeVouchers: IOrderCalculationVoucher[];
  };
  paymentType: PaymentType;
  isTaxExempt: boolean;
  taxRate: number;
}

export const getVoucherAmountOwedByHotel = (
  input: IHotelTotalNetInput
): Decimal => {
  const { receiptAmount, totalNet, vouchers, taxRate } = input;
  // if (vouchers.orderVoucher || vouchers.prefixeVouchers?.length > 0) {
  //   checkOverage(paymentType, grandTotal, getDecimalValue(tip));
  // }

  if (vouchers.orderVoucher) {
    const voucher = vouchers.orderVoucher;
    if (
      voucher.payer === VoucherProgramPayer.ALFRED_PROGRAM ||
      voucher.payer === VoucherProgramPayer.ALFRED_RECOVERY
    ) {
      return new Decimal(0);
    }
    const percentageValue: Decimal = voucher.payerPercentage
      ? new Decimal(voucher.payerPercentage)
      : new Decimal(100);
    if (
      voucher.voucherProgramType === VoucherProgramType.DISCOUNT ||
      voucher.voucherProgramType === VoucherProgramType.PER_DIEM
    ) {
      // if (isTaxExempt) {
      // 	return new Decimal(0);
      // } // this is how it is in oms but it shouldn't and should be discussed
      const voucherAmountOwedByHotelWithTax = getVoucherValue(
        receiptAmount,
        voucher
      )
        .mul(percentageValue)
        .div(new Decimal(100));

      const valwitax = getValueWithoutTax(
        taxRate,
        voucherAmountOwedByHotelWithTax
      );
      return valwitax;
    }
  }

  if (vouchers.prefixeVouchers?.length) {
    let totalValue = new Decimal(0);
    const vouchersChecked = {};
    vouchers.prefixeVouchers.forEach((voucher: IOrderCalculationVoucher) => {
      if (voucher.voucherProgramType !== VoucherProgramType.PRE_FIXE) {
        throw new Error(
          `Cannot have multiples on voucher with type ${voucher.voucherProgramType}`
        );
      }
      if (!vouchersChecked[voucher.id]) {
        let prefixePercentageValue = new Decimal(0);
        if (voucher.payer === VoucherProgramPayer.HOTEL) {
          prefixePercentageValue = voucher.payerPercentage
            ? new Decimal(voucher.payerPercentage)
            : new Decimal(100);
        }
        const voucherAmountOwedByHotelWithTax = getVoucherValue(
          totalNet,
          voucher
        )
          .mul(prefixePercentageValue)
          .div(new Decimal(100));
        const prefixeValue = getValueWithoutTax(
          taxRate,
          voucherAmountOwedByHotelWithTax
        );
        totalValue = totalValue.add(prefixeValue);
        vouchersChecked[voucher.id] = true;
      }
    });
    return totalValue;
  }

  return new Decimal(0);
};

export const checkOverage = (
  paymentType: PaymentType,
  grandTotal: Decimal,
  tip: Decimal
) => {
  if (
    grandTotal.comparedTo(new Decimal(0)) <= 0 &&
    paymentType == PaymentType.CREDIT_CARD
  ) {
    throw new HttpException(
      "Payment type should be charge to room",
      HttpStatus.CONFLICT
    );
  }
  if (
    grandTotal.add(tip).comparedTo(new Decimal(0)) > 0 &&
    paymentType !== PaymentType.CREDIT_CARD
  ) {
    throw new HttpException(
      "Credit card required for orders with overage",
      HttpStatus.CONFLICT
    );
  }
};

export const calculateHotelTotalNet = (input: IHotelTotalNetInput) => {
  const { discount, receiptAmount, paymentType } = input;

  const voucherAmountOwedByHotel = getVoucherAmountOwedByHotel(input);

  if (
    paymentType === PaymentType.CREDIT_CARD ||
    paymentType === PaymentType.PAY_LATER
  ) {
    return voucherAmountOwedByHotel;
  }
  if (paymentType === PaymentType.ROOM_CHARGE) {
    const discountValue = getDiscountValue(receiptAmount, discount);

    const hotelTotalNet =
      voucherAmountOwedByHotel &&
      voucherAmountOwedByHotel.comparedTo(new Decimal(0)) >= 0
        ? voucherAmountOwedByHotel
        : receiptAmount;
    return hotelTotalNet.comparedTo(new Decimal(0)) > 0
      ? hotelTotalNet.sub(discountValue)
      : new Decimal(0);
  }

  throw new Error("Unsupported Payment type");
};

export interface IHotelTaxInput {
  hotelTotalNet: Decimal;
  isTaxExempt: boolean;
  taxRate: number;
}

export const calculateHotelTax = (input: IHotelTaxInput): Decimal => {
  const { hotelTotalNet, isTaxExempt, taxRate } = input;

  return isTaxExempt
    ? new Decimal(0)
    : calculateTaxAmount({
        taxRate: taxRate,
        amount: hotelTotalNet,
        isTaxExempt: isTaxExempt,
      });
};

export const calculateHotelGrandTotal = (
  hotelTotalNet: Decimal,
  hotelTax: Decimal,
  tip: Decimal,
  paymentType: PaymentType,
  deliveryFee = RELAY_DELIVERY_FEE
): Decimal => {
  if (paymentType === PaymentType.CREDIT_CARD) {
    tip = new Decimal(0);
  }
  return hotelTotalNet.add(tip).add(hotelTax).add(getDecimalValue(deliveryFee));
};
