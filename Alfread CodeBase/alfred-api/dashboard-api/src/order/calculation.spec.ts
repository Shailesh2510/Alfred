import Decimal from "decimal.js-light";
import {
  AmountType,
  calculate,
  calculateBasicTotalPrice,
  calculateCustomItemsValue,
  calculateItemsValue,
  calculateModifiersValue,
  calculateOrderItemsValue,
  calculateRefund,
  calculateRevenue,
  calculateTaxAmount,
  getPerdiemVoucherValue,
  getTotalVoucherPrice,
  getValueWithTax,
  getVoucherAmountOwedByHotel,
  IOrderCalculationVoucher,
  IOrderCustomItem,
  PaymentType,
  PriceMeasurementType,
  validateCustomItemData,
  validateItemData, validatePrefixePayload
} from "./calculation";
import { VoucherProgramPayer, VoucherProgramType } from "database/entities/voucher_program.entity";
const DELIVERY_FEE_ZERO = 0.00;

const getBaseItem = () => {
  return {
    id: 1,
    modifiers: [{
      id: 1,
      options: [{
        id: 1,
        price: 1,
        quantity: 1
      }]
    }],
    price: 1,
    quantity: 1
  };
};

const basicItems = (size: number) => {
  const items = [];
  for (let i = 0; i < size; i++) {
    const it = Object.assign({}, getBaseItem());
    items.push({ ...it });
  }
  return items;
};

const getItems = (def: boolean,
  input?: {
		size: number,
		price: number,
		quantity: number,
		optionPrice: number,
		optionQuantity: number
	}
) => {
  if (def) {
    return [{
      id: 1,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 2,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 3,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 4,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 5,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 6,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 7,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 8,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 9,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    },
    {
      id: 10,
      price: 14,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 12,
            quantity: 1
          },
          {
            id: 1,
            price: 12,
            quantity: 1
          }
        ]
      }]
    }];
  }
  const { size, price, quantity, optionPrice, optionQuantity } = input;
  const items = basicItems(size);
  return items.map((item) => {
    item.price = price;
    item.quantity = quantity;
    item.modifiers.forEach((modifier) => {
      modifier.options.forEach((option) => {
        option.price = optionPrice;
        option.quantity = optionQuantity;
      });
    });
    return item;
  });
};

const logValues = (values) => {
  const {
    receiptAmount,
    taxAmount,
    totalNet,
    totalGross,
    grandTotal,
    hotelTotalNet,
    hotelTax,
    hotelGrandTotal,
    totalVoucherPrice,
    tip
  } = values;

  console.log({
    receiptAmount: receiptAmount.toFixed(2),
    totalNet: totalNet.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    tip: tip.toFixed(2),
    totalGross: totalGross.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    hotelTotalNet: hotelTotalNet.toFixed(2),
    hotelTax: hotelTax.toFixed(2),
    hotelGrandTotal: hotelGrandTotal.toFixed(2),
    totalVoucherPrice: totalVoucherPrice.toFixed(2)

  });
};

describe("Calculations", () => {
  it("should throw invalid item because id is null", async () => {
    const item = getBaseItem();
    item.id = null;
    const t = () => {
      validateItemData(item);
    };
    expect(t).toThrow(Error);
  });
  it("should throw invalid item because price is null", async () => {
    const item = getBaseItem();
    item.price = null;
    const t = () => {
      validateItemData(item);
    };
    expect(t).toThrow(Error);
  });
  it("should throw invalid item because quantity is null or zero", async () => {
    const item = getBaseItem();

    const nullT = () => {
      item.quantity = null;
      validateItemData(item);
    };
    const zeroT = () => {
      item.quantity = 0;
      validateItemData(item);
    };
    expect(nullT).toThrow(Error);
    expect(zeroT).toThrow(Error);
  });

  it("should throw invalid custom item because price is null", async () => {
    const item: IOrderCustomItem = {
      price: null,
      quantity: 1
    };
    const t = () => {
      validateCustomItemData(item);
    };
    expect(t).toThrow(Error);
  });

  it("should throw invalid custom item because quantity is null", async () => {
    const item: IOrderCustomItem = {
      price: 1,
      quantity: null
    };
    const t = () => {
      validateCustomItemData(item);
    };
    expect(t).toThrow(Error);
  });

  it("should throw invalid custom item because it has quantity and id null", async () => {
    const item: IOrderCustomItem = {
      price: null,
      quantity: null
    };
    const t = () => {
      validateCustomItemData(item);
    };
    expect(t).toThrow(Error);
  });

  it("should validate", async () => {
    expect(validateItemData(getBaseItem())).toBe(undefined);
  });

  it("should calculate total voucher price of discount voucher", async () => {
    const receiptAmount = new Decimal(100);
    const grandTotal = new Decimal(100);
    // payer does not matter in calculation voucher
    // payer percentage also not important
    const vouchersv1: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.DISCOUNT,
      value: 500
    }];
    const vouchersv2: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.DISCOUNT,
      value: 80
    }];
    const vouchersv3: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.DISCOUNT,
      value: 10
    }];
    const vouchersv4: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.DISCOUNT,
      value: 50
    }];
    const vouchersv5: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.DISCOUNT,
      value: 50
    }, {
      id: 2,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.DISCOUNT,
      value: 50
    }];
    const totalVoucherPricev1 = getTotalVoucherPrice(receiptAmount, vouchersv1);
    const totalVoucherPricev2 = getTotalVoucherPrice(receiptAmount, vouchersv2);
    const totalVoucherPricev3 = getTotalVoucherPrice(receiptAmount, vouchersv3);
    const totalVoucherPricev4 = getTotalVoucherPrice(receiptAmount, vouchersv4);
    const t = () => {
      getTotalVoucherPrice(receiptAmount, vouchersv5);
    };

    expect(totalVoucherPricev1).toEqual(receiptAmount);
    expect(totalVoucherPricev2).toEqual(new Decimal(80));
    expect(totalVoucherPricev3).toEqual(new Decimal(10)); // 10 percent
    expect(totalVoucherPricev4).toEqual(new Decimal(50)); // 50 percent
    expect(t).toThrow(Error); // cannot have two discount vouchers

    console.log({
      totalVoucherPricev1: totalVoucherPricev1.toFixed(2),
      totalVoucherPricev2: totalVoucherPricev2.toFixed(2),
      totalVoucherPricev3: totalVoucherPricev3.toFixed(2),
      totalVoucherPricev4: totalVoucherPricev4.toFixed(2)
    });
  });

  it("should calculate total voucher price of PER_DIEM voucher", async () => {
    const receiptAmount = new Decimal(100);
    // payer does not matter in calculation voucher
    // payer percentage also not important
    const vouchersv1: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 500,
      valueUsed: 0
    }];
    const vouchersv2: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 80,
      valueUsed: 0
    }];
    const vouchersv3: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 10,
      valueUsed: 0
    }];
    const vouchersv4: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 50,
      valueUsed: 0
    }];
    const vouchersv5: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 50,
      valueUsed: 0
    }, {
      id: 2,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 50,
      valueUsed: 0
    }];
    const vouchersv6: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 70,
      valueUsed: 20
    }];
    const vouchersv7: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.PER_DIEM,
      value: 70,
      valueUsed: 20
    }];
    const vouchersv8: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PER_DIEM,
      value: 70,
      valueUsed: null
    }];
    const totalVoucherPricev1 = getTotalVoucherPrice(receiptAmount, vouchersv1);
    const totalVoucherPricev2 = getTotalVoucherPrice(receiptAmount, vouchersv2);
    const totalVoucherPricev3 = getTotalVoucherPrice(receiptAmount, vouchersv3);
    const totalVoucherPricev4 = getTotalVoucherPrice(receiptAmount, vouchersv4);
    const totalVoucherPricev6 = getTotalVoucherPrice(receiptAmount, vouchersv6);

    const t1 = () => {
      getTotalVoucherPrice(receiptAmount, vouchersv5);
    };
    const t2 = () => {
      getTotalVoucherPrice(receiptAmount, vouchersv7);
    };

    expect(totalVoucherPricev1).toEqual(new Decimal(100));
    expect(totalVoucherPricev2).toEqual(new Decimal(80));
    expect(totalVoucherPricev3).toEqual(new Decimal(10));
    expect(totalVoucherPricev4).toEqual(new Decimal(50));
    expect(totalVoucherPricev6).toEqual(new Decimal(50));
    expect(t1).toThrow(Error); // cannot have two PER_DIEM vouchers
    expect(t2).toThrow(Error); // PER_DIEM only supports AMOUNT type

    const PER_DIEMv1 = getPerdiemVoucherValue(vouchersv1[0]);
    const PER_DIEMv2 = getPerdiemVoucherValue(vouchersv2[0]);
    const PER_DIEMv3 = getPerdiemVoucherValue(vouchersv3[0]);
    const PER_DIEMv4 = getPerdiemVoucherValue(vouchersv4[0]);
    const PER_DIEMv6 = getPerdiemVoucherValue(vouchersv6[0]);
    const t3 = () => {
      getPerdiemVoucherValue(vouchersv7[0]);
    };
    const t4 = () => {
      getPerdiemVoucherValue(vouchersv8[0]);
    };

    expect(PER_DIEMv1).toEqual(new Decimal(500));
    expect(PER_DIEMv2).toEqual(new Decimal(80));
    expect(PER_DIEMv3).toEqual(new Decimal(10));
    expect(PER_DIEMv4).toEqual(new Decimal(50));
    expect(PER_DIEMv6).toEqual(new Decimal(50));
    expect(t3).toThrow(Error); // PER_DIEM only supports AMOUNT type
    expect(t4).toThrow(Error); // PER_DIEM attributes missing for PER_DIEM voucher value

    console.log({
      PER_DIEMv1: PER_DIEMv1.toFixed(2),
      PER_DIEMv2: PER_DIEMv2.toFixed(2),
      PER_DIEMv3: PER_DIEMv3.toFixed(2),
      PER_DIEMv4: PER_DIEMv4.toFixed(2),
      PER_DIEMv6: PER_DIEMv6.toFixed(2)
    });
  });

  it("should calculate total voucher price of PREFIXE voucher", async () => {
    const receiptAmount = new Decimal(100);
    // payer does not matter in calculation voucher
    // payer percentage also not important
    const vouchersv1: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 500
    }];
    const vouchersv2: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 80
    }];
    const vouchersv3: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 10
    }];
    const vouchersv4: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 50
    }];
    const vouchersv5: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 30.5
    }, {
      id: 2,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 25.5
    }, {
      id: 3,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 51.2
    }, {
      id: 4,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 50.5
    }];
    const vouchersv6: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.FIXED,
      type: VoucherProgramType.PRE_FIXE,
      value: 70
    }];
    const vouchersv7: IOrderCalculationVoucher[] = [{
      id: 1,
      payer: VoucherProgramPayer.ALFRED_PROGRAM,
      payerPercentage: 100,
      amountType: AmountType.PERCENTAGE,
      type: VoucherProgramType.PRE_FIXE,
      value: 70
    }];
    const totalVoucherPricev1 = getTotalVoucherPrice(receiptAmount, vouchersv1);
    const totalVoucherPricev2 = getTotalVoucherPrice(receiptAmount, vouchersv2);
    const totalVoucherPricev3 = getTotalVoucherPrice(receiptAmount, vouchersv3);
    const totalVoucherPricev4 = getTotalVoucherPrice(receiptAmount, vouchersv4);
    const totalVoucherPricev5 = getTotalVoucherPrice(receiptAmount, vouchersv5);
    const totalVoucherPricev6 = getTotalVoucherPrice(receiptAmount, vouchersv6);

    const t2 = () => {
      getTotalVoucherPrice(receiptAmount, vouchersv7);
    };

    expect(totalVoucherPricev1).toEqual(new Decimal(500));
    expect(totalVoucherPricev2).toEqual(new Decimal(80));
    expect(totalVoucherPricev3).toEqual(new Decimal(10));
    expect(totalVoucherPricev4).toEqual(new Decimal(50));
    expect(totalVoucherPricev5).toEqual(new Decimal(157.7));
    expect(totalVoucherPricev6).toEqual(new Decimal(70));
    expect(t2).toThrow(Error); // PER_DIEM only supports AMOUNT type

    console.log({
      totalVoucherPricev1: totalVoucherPricev1.toFixed(2),
      totalVoucherPricev2: totalVoucherPricev2.toFixed(2),
      totalVoucherPricev3: totalVoucherPricev3.toFixed(2),
      totalVoucherPricev4: totalVoucherPricev4.toFixed(2),
      totalVoucherPricev6: totalVoucherPricev6.toFixed(2)
    });
  });

  it("should calculate basic total price", async () => {
    const basicCalc1 = calculateBasicTotalPrice({
      id: 1,
      price: 10,
      quantity: 1
    }); // 10
    const basicCalc2 = calculateBasicTotalPrice({
      id: 1,
      price: 10,
      quantity: 2
    }); // 20
    const basicCalc3 = calculateBasicTotalPrice({
      id: 1,
      price: 10,
      quantity: 40
    }); // 400
    const basicCalc4 = calculateBasicTotalPrice({
      id: 1,
      price: 13.5,
      quantity: 40
    }); // 540
    const basicCalc5 = calculateBasicTotalPrice({
      id: 1,
      price: 0,
      quantity: 40
    }); // 0

    const basicCalc6 = calculateBasicTotalPrice({
      id: 1,
      price: 200,
      quantity: 40,
      codeId: 1,
      ruleId: 1
    }); // 0

    const basicCalc7 = calculateBasicTotalPrice({
      id: 1,
      price: 200,
      quantity: 40,
      codeId: 1,
      ruleId: 12
    }); // 0

    const t1 = () => {
      calculateBasicTotalPrice({
        id: 1,
        price: 0,
        quantity: 40,
        codeId: 1
      }); // 0
    };
    const t2 = () => {
      calculateBasicTotalPrice({
        id: 1,
        price: 0,
        quantity: 40,
        ruleId: 1
      }); // 0
    };

    expect(basicCalc1).toEqual(new Decimal(10));
    expect(basicCalc2).toEqual(new Decimal(20));
    expect(basicCalc3).toEqual(new Decimal(400));
    expect(basicCalc4).toEqual(new Decimal(540));
    expect(basicCalc5).toEqual(new Decimal(0));
    expect(basicCalc6).toEqual(new Decimal(0));
    expect(basicCalc7).toEqual(new Decimal(0));
    expect(t1).toThrow(Error);
    expect(t2).toThrow(Error);
  });

  it("should validate PREFIXE payload", async () => {

  });

  it("should calculate custom items value", async () => {
    const itemsv1 = calculateCustomItemsValue([{
      price: 10,
      quantity: 1
    }]);
    const itemsv2 = calculateCustomItemsValue([{
      price: 10.5,
      quantity: 10
    }]);
    const itemsv3 = calculateCustomItemsValue([{
      price: 0,
      quantity: 10
    }]);

    expect(itemsv1).toEqual(new Decimal(10));
    expect(itemsv2).toEqual(new Decimal(105));
    expect(itemsv3).toEqual(new Decimal(0));
  });

  it("should calculate modifiers value", async () => {
    const calcv1 = calculateModifiersValue([{
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      }]
    }], 1); // 10
    const calcv2 = calculateModifiersValue([{
      id: 1,
      options: [{
        id: 1,
        price: 15,
        quantity: 2
      }]
    }], 1); // 30
    const calcv3 = calculateModifiersValue([{
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      },
      {
        id: 2,
        price: 1,
        quantity: 5
      }]
    }], 1); // 15
    const calcv4 = calculateModifiersValue([{
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      },
      {
        id: 1,
        price: 10,
        quantity: 1
      }]
    },
    {
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      },
      {
        id: 1,
        price: 10,
        quantity: 1
      }]
    },
    {
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      },
      {
        id: 1,
        price: 10,
        quantity: 1
      }]
    }], 1); // 60

    const calcv5 = calculateModifiersValue([{
      id: 1,
      options: [{
        id: 1,
        price: 10,
        quantity: 1
      }]
    }], 4); // 40

    expect(calcv1).toEqual(new Decimal(10));
    expect(calcv2).toEqual(new Decimal(30));
    expect(calcv3).toEqual(new Decimal(15));
    expect(calcv4).toEqual(new Decimal(60));
    expect(calcv5).toEqual(new Decimal(40));
  });

  it("should calculcate order items value", async () => {
    const itemsValuev1 = calculateOrderItemsValue([{
      id: 1,
      price: 5,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 15,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 5,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 2,
            quantity: 1
          },
          {
            id: 1,
            price: 2,
            quantity: 1
          }
        ]
      }]
    }]);
    const itemsValuev2 = calculateOrderItemsValue([{
      id: 1,
      price: 5,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 15,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 5,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 0,
            quantity: 1
          },
          {
            id: 1,
            price: 0,
            quantity: 1
          }
        ]
      }]
    }]);
    const itemsValuev3 = calculateOrderItemsValue([{
      id: 1,
      price: 0,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 0,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 0,
      quantity: 2,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 0,
            quantity: 1
          },
          {
            id: 1,
            price: 0,
            quantity: 1
          }
        ]
      }]
    }]);

    expect(itemsValuev1).toEqual(new Decimal(58));
    expect(itemsValuev2).toEqual(new Decimal(50));
    expect(itemsValuev3).toEqual(new Decimal(0));
  });

  it("should calculate total items value", async () => {
    const itemsval1 = calculateItemsValue([{
      id: 1,
      price: 5,
      quantity: 2,
      modifiers: []
    },
    {
      id: 1,
      price: 5,
      quantity: 3,
      modifiers: [{
        id: 1,
        options: [
          {
            id: 1,
            price: 2,
            quantity: 2
          },
          {
            id: 1,
            price: 3,
            quantity: 4
          }
        ]
      }]
    }], [
      {
        price: 15,
        quantity: 2
      },
      {
        price: 15,
        quantity: 2
      }
    ]);

    const t = () => {
      calculateItemsValue([{
        id: 1,
        price: 5,
        quantity: 2,
        modifiers: []
      },
      {
        id: 1,
        price: 5,
        quantity: 3,
        modifiers: [{
          id: 1,
          options: [
            {
              id: 1,
              price: 2,
              quantity: 2
            },
            {
              id: 1,
              price: 3,
              quantity: 4
            }
          ]
        }]
      }], [
        {
          price: null, // should throw exception
          quantity: 2
        },
        {
          price: 15,
          quantity: 2
        }
      ]);
    };

    expect(itemsval1).toEqual(new Decimal(133));
    expect(t).toThrow(Error);
  });

  it("should calculate tax amount", async () => {
    const taxv1 = calculateTaxAmount({
      amount: new Decimal(10),
      taxRate: 10,
      isTaxExempt: false
    }); // 1
    const taxv2 = calculateTaxAmount({
      amount: new Decimal(98.77),
      taxRate: 8.895,
      isTaxExempt: false
    }); // 8.785 -> 8.79
    const taxv3 = calculateTaxAmount({
      amount: new Decimal(0),
      taxRate: 8.895,
      isTaxExempt: false
    }); // 0
    const taxv4 = calculateTaxAmount({
      amount: new Decimal(1403.97),
      taxRate: 8.895,
      isTaxExempt: false
    }); // 124.88
    const taxv5 = calculateTaxAmount({
      amount: new Decimal(1403.97),
      taxRate: 8.895,
      isTaxExempt: true
    }); // 0

    expect(taxv1).toEqual(new Decimal(1));
    expect(taxv2.toDecimalPlaces(2)).toEqual(new Decimal(8.79));
    expect(taxv3).toEqual(new Decimal(0));
    expect(taxv4.toDecimalPlaces(2)).toEqual(new Decimal(124.88));
    expect(taxv5).toEqual(new Decimal(0));
  });

  it("should calculate discount voucher amount owed by hotel", async () => {
    const amountv1 = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal: new Decimal(100),
      isTaxExempt: false,
      paymentType: PaymentType.CREDIT_CARD,
      receiptAmount: new Decimal(100),
      taxRate: 10,
      tip: 0,
      totalNet: new Decimal(10),
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 50
      }]
    }); // 45.45

    const amountv2 = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal: new Decimal(100),
      isTaxExempt: false,
      paymentType: PaymentType.CREDIT_CARD,
      receiptAmount: new Decimal(100),
      taxRate: 10,
      tip: 0,
      totalNet: new Decimal(10),
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 70
      }]
    }); // 63.64

    const amountv3 = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal: new Decimal(100),
      isTaxExempt: false,
      paymentType: PaymentType.CREDIT_CARD,
      receiptAmount: new Decimal(100),
      taxRate: 8.895,
      tip: 0,
      totalNet: new Decimal(10),
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 70
      }]
    }); // 64.28

    const amountv4 = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal: new Decimal(100),
      isTaxExempt: false,
      paymentType: PaymentType.CREDIT_CARD,
      receiptAmount: new Decimal(100),

      taxRate: 8.895,
      tip: 0,
      totalNet: new Decimal(10),
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 70
      }]
    }); // 32.14

    const amountv5 = getVoucherAmountOwedByHotel({
      discount: null,
      grandTotal: new Decimal(0),
      isTaxExempt: false,
      paymentType: PaymentType.ROOM_CHARGE,
      receiptAmount: new Decimal(1500),

      taxRate: 8.895,
      tip: 0,
      totalNet: new Decimal(1500),
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 10,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 1500
      }]
    }); // 137.75

    expect(amountv1.toDecimalPlaces(2)).toEqual(new Decimal(45.45));
    expect(amountv2.toDecimalPlaces(2)).toEqual(new Decimal(63.64));
    expect(amountv3.toDecimalPlaces(2)).toEqual(new Decimal(64.28));
    expect(amountv4.toDecimalPlaces(2)).toEqual(new Decimal(32.14));
    expect(amountv5.toDecimalPlaces(2)).toEqual(new Decimal(137.75));
  });
});

describe("Complete calculations without discounts, without vouchers", () => {
  it("should calculate item values without discount and voucher without tax exempt with charge to room", async () => {
    const items = getItems(false, {
      size: 2,
      price: 2,
      quantity: 1,
      optionPrice: 0,
      optionQuantity: 1
    });

    const values = calculate({
      items: items,
      deliveryFee: DELIVERY_FEE_ZERO,
      tip: 0,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,
      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(4);
    expect(taxAmount).toEqual(0.4);
    expect(totalNet).toEqual(4);
    expect(totalGross).toEqual(4.4);
    expect(grandTotal).toEqual(4.4);
    expect(hotelTotalNet).toEqual(4);
    expect(hotelTax).toEqual(0.4);
    expect(hotelGrandTotal).toEqual(4.4);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate item values without discount and voucher with tax exempt with charge to room", async () => {
    const items = getItems(false, {
      size: 2,
      price: 15,
      quantity: 2,
      optionPrice: 2,
      optionQuantity: 4
    });

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(92);
    expect(taxAmount).toEqual(0);
    expect(totalNet).toEqual(92);
    expect(totalGross).toEqual(92);
    expect(grandTotal).toEqual(92);
    expect(hotelTotalNet).toEqual(92);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(92);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate item values without discount and voucher with tax exempt with card", async () => {
    const items = getItems(false, {
      size: 2,
      price: 15,
      quantity: 2,
      optionPrice: 2,
      optionQuantity: 4
    });

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(92);
    expect(taxAmount).toEqual(0);
    expect(totalNet).toEqual(92);
    expect(totalGross).toEqual(92);
    expect(grandTotal).toEqual(92);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate item values without discount and voucher without tax exempt with card", async () => {
    const items = getItems(false, {
      size: 2,
      price: 15,
      quantity: 2,
      optionPrice: 2,
      optionQuantity: 4
    });

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(92);
    expect(taxAmount).toEqual(9.2);
    expect(totalNet).toEqual(92);
    expect(totalGross).toEqual(101.2);
    expect(grandTotal).toEqual(101.2);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });
});

describe("Calculations with discounts", () => {
  it("should calculate with discount type percentage with type card", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: {
        type: PriceMeasurementType.PERCENTAGE,
        value: 50,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(380);
    expect(taxAmount).toEqual(38.0);
    expect(totalGross).toEqual(418.0);
    expect(grandTotal).toEqual(418.0);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should throw error because discount is being used more than it should", async () => {
    const items = getItems(true);
    const t = () => {
      calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: {
          type: PriceMeasurementType.FIXED,
          value: 1000,
          valueUsed: 1200
        },
        isTaxExempt: false,
        taxRate: 10,
        vouchers: []
      });
    };

    expect(t).toThrow(Error);
  });

  it("v1-should calculate with discount type amount with type card", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: {
        type: PriceMeasurementType.FIXED,
        value: 380,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(380);
    expect(taxAmount).toEqual(38.0);
    expect(totalGross).toEqual(418.0);
    expect(grandTotal).toEqual(418.0);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("v2-should calculate with discount type amount with type card", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: {
        type: PriceMeasurementType.FIXED,
        value: 400,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(360);
    expect(taxAmount).toEqual(36.0);
    expect(totalGross).toEqual(396.0);
    expect(grandTotal).toEqual(396.0);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate with discount type amount with type card with tip", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 10,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: {
        type: PriceMeasurementType.FIXED,
        value: 400,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(360);
    expect(taxAmount).toEqual(36.0);
    expect(totalGross).toEqual(396.0);
    expect(grandTotal).toEqual(406.0);
    expect(hotelTotalNet).toEqual(0);
    expect(hotelTax).toEqual(0);
    expect(hotelGrandTotal).toEqual(0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate with discount type amount with type charge to room with tip", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 10,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: {
        type: PriceMeasurementType.FIXED,
        value: 400,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(360);
    expect(taxAmount).toEqual(36.0);
    expect(totalGross).toEqual(396.0);
    expect(grandTotal).toEqual(406.0);
    expect(hotelTotalNet).toEqual(360);
    expect(hotelTax).toEqual(36.0);
    expect(hotelGrandTotal).toEqual(406.0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should calculate with discount type amount with type charge to room without tip", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: {
        type: PriceMeasurementType.FIXED,
        value: 400,
        valueUsed: 0
      },
      isTaxExempt: false,

      taxRate: 10,
      vouchers: []
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760);
    expect(totalNet).toEqual(360);
    expect(taxAmount).toEqual(36.0);
    expect(totalGross).toEqual(396.0);
    expect(grandTotal).toEqual(396.0);
    expect(hotelTotalNet).toEqual(360);
    expect(hotelTax).toEqual(36.0);
    expect(hotelGrandTotal).toEqual(396.0);
    expect(totalVoucherPrice).toEqual(0);
  });

  it("should throw error if discount is applied and any voucher is also present", async () => {
    const items = getItems(true);

    const t1 = () => {
      calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: {
          type: PriceMeasurementType.FIXED,
          value: 400,
          valueUsed: 0
        },
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PER_DIEM,
          value: 500,
          valueUsed: 110
        }]
      });
    };
    const t2 = () => {
      calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: {
          type: PriceMeasurementType.FIXED,
          value: 400,
          valueUsed: 0
        },
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.DISCOUNT,
          value: 500
        }]
      });
    };
    const t3 = () => {
      calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: {
          type: PriceMeasurementType.FIXED,
          value: 400,
          valueUsed: 0
        },
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 500
        }]
      });
    };

    expect(t1).toThrow(Error);
    expect(t2).toThrow(Error);
    expect(t3).toThrow(Error);
  });
});

describe("Calculation with discount vouchers with/without overage", () => {
  it("should calculate tax exempt, discount voucher percentage, payer TENANT, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 760
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(0.0);
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(0.0);
    expect(totalVoucherPrice).toEqual(760.0);
  });

  it("should calculate not tax exempt, discount voucher percentage, payer hotel, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 760
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(690.91);
    expect(hotelTax).toEqual(69.09);
    expect(hotelGrandTotal).toEqual(760.0);
    expect(totalVoucherPrice).toEqual(760.0);
  });

  it("should calculate tax exempt, discount voucher amount, payer hotel, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 760
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(690.91);
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(690.91);
    expect(totalVoucherPrice).toEqual(760.0);
  });

  it("should calculate is not tax exempt, discount voucher amount, payer hotel, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 760
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(690.91);
    expect(hotelTax).toEqual(69.09);
    expect(hotelGrandTotal).toEqual(760.0);
    expect(totalVoucherPrice).toEqual(760.0);
  });

  it("should calculate is not tax exempt, discount voucher percentage, payer hotel, charge to room", async () => {
    const items = getItems(true);
    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.PERCENTAGE,
        type: VoucherProgramType.DISCOUNT,
        value: 100
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(345.45);
    expect(hotelTax).toEqual(34.55);
    expect(hotelGrandTotal).toEqual(380.0);
    expect(totalVoucherPrice).toEqual(760.0);
  });

  it(
    "should calculate is not tax exempt, with bad discount voucher percentage, payer hotel, charge to room",
    async () => {
      const items = getItems(true);
      const values = calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.PERCENTAGE,
          type: VoucherProgramType.DISCOUNT,
          value: 0
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(760.0);
      expect(totalNet).toEqual(760.0);
      expect(taxAmount).toEqual(76.0);
      expect(totalGross).toEqual(836.0);
      expect(grandTotal).toEqual(836.0);
      expect(hotelTotalNet).toEqual(0.0);
      expect(hotelTax).toEqual(0.0);
      expect(hotelGrandTotal).toEqual(0.0);
      expect(totalVoucherPrice).toEqual(0.0);
    });

  it(
    "should calculate is not tax exempt, with discount voucher percentage, payer hotel, charge to room",
    async () => {
      const items = getItems(true);
      const t = () => {
        calculate({
          items: items,
          tip: 0,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.ROOM_CHARGE,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [{
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 50,
            amountType: AmountType.PERCENTAGE,
            type: VoucherProgramType.DISCOUNT,
            value: 50
          }]
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "should calculate is not tax exempt, with discount voucher percentage, payer hotel, charge to room with tip",
    async () => {
      const items = getItems(true);
      const t = () => {
        calculate({
          items: items,
          tip: 1,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.ROOM_CHARGE,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [{
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.PERCENTAGE,
            type: VoucherProgramType.DISCOUNT,
            value: 100
          }]
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "should calculate is not tax exempt, with bad discount voucher percentage, payer hotel, card with tip",
    async () => {
      const items = getItems(true);
      const values = calculate({
        items: items,
        tip: 1,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.PERCENTAGE,
          type: VoucherProgramType.DISCOUNT,
          value: 100
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(760.0);
      expect(totalNet).toEqual(0.0);
      expect(taxAmount).toEqual(0.0);
      expect(totalGross).toEqual(0.0);
      expect(grandTotal).toEqual(1.0);
      expect(hotelTotalNet).toEqual(345.45);
      expect(hotelTax).toEqual(34.55);
      expect(hotelGrandTotal).toEqual(380.0);
      expect(totalVoucherPrice).toEqual(760.0);
    });

  it(
    "should calculate is not tax exempt, with discount voucher amount, payer hotel, charge to room, with tip",
    async () => {
      const items = getItems(true);
      const t = () => {
        calculate({
          items: items,
          tip: 1,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.ROOM_CHARGE,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [{
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 50,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.DISCOUNT,
            value: 1000
          }]
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "should calculate is not tax exempt, with discount voucher amount, payer hotel, card, with tip",
    async () => {
      const items = getItems(true);
      const values = calculate({
        items: items,
        tip: 1,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.DISCOUNT,
          value: 1000
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(760.0);
      expect(totalNet).toEqual(0.0);
      expect(taxAmount).toEqual(0.0);
      expect(totalGross).toEqual(0.0);
      expect(grandTotal).toEqual(1.0);
      expect(hotelTotalNet).toEqual(345.45);
      expect(hotelTax).toEqual(34.55);
      expect(hotelGrandTotal).toEqual(380.0);
      expect(totalVoucherPrice).toEqual(760.00);
    });
});

describe("Calculation with PER_DIEM vouchers with/without overage", () => {
  it("should calculate tax exempt, PER_DIEM voucher amount, payer TENANT, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 1000,
        valueUsed: 0
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(76.0);
    expect(totalGross).toEqual(836.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(0.0);
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(0.0);
    expect(totalVoucherPrice).toEqual(836.0);
  });

  it("should calculate not tax exempt, PER_DIEM voucher percentage, payer hotel, charge to room", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 1001,
        valueUsed: 165
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(76.0);
    expect(totalGross).toEqual(836.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(380.00);
    expect(hotelTax).toEqual(38.00);
    expect(hotelGrandTotal).toEqual(418.00);
    expect(totalVoucherPrice).toEqual(836.0);
  });

  it("should calculate tax exempt, PER_DIEM voucher amount, payer hotel, charge to room", async () => {
    const items = getItems(true);

    const t = () => {
      calculate({
        items: items,
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 100,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PER_DIEM,
          value: 760,
          valueUsed: 160
        }]
      });
    };
    expect(t).toThrow(Error);
  });

  it("should calculate is not tax exempt, PER_DIEM voucher amount, payer hotel, card", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 565,
        valueUsed: 165
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(76.0);
    expect(totalGross).toEqual(836.0);
    expect(grandTotal).toEqual(436.0);
    expect(hotelTotalNet).toEqual(363.64);
    expect(hotelTax).toEqual(36.36);
    expect(hotelGrandTotal).toEqual(400.00);
    expect(totalVoucherPrice).toEqual(400.0);
  });

  it("should calculate is not tax exempt, PER_DIEM voucher amount, payer hotel 50%, card", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 565,
        valueUsed: 165
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(76.0);
    expect(totalGross).toEqual(836.0);
    expect(grandTotal).toEqual(436.0);
    expect(hotelTotalNet).toEqual(181.82);
    expect(hotelTax).toEqual(18.18);
    expect(hotelGrandTotal).toEqual(200.00);
    expect(totalVoucherPrice).toEqual(400.0);
  });

  it("should calculate is not tax exempt, PER_DIEM voucher amount, payer hotel 50%, card with tip", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 1,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: false,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 565,
        valueUsed: 165
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(76.0);
    expect(totalGross).toEqual(836.0);
    expect(grandTotal).toEqual(437.0);
    expect(hotelTotalNet).toEqual(181.82);
    expect(hotelTax).toEqual(18.18);
    expect(hotelGrandTotal).toEqual(200.00);
    expect(totalVoucherPrice).toEqual(400.0);
  });

  it("should calculate is tax exempt, PER_DIEM voucher amount, payer hotel 50%, card with tip", async () => {
    const items = getItems(true);

    const values = calculate({
      items: items,
      tip: 1,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 565,
        valueUsed: 165
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(760.0);
    expect(totalNet).toEqual(760.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(760.0);
    expect(grandTotal).toEqual(361.0);
    expect(hotelTotalNet).toEqual(181.82); // in oms is zeo
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(181.82);
    expect(totalVoucherPrice).toEqual(400.0);
  });
});

// todo: verify all PREFIXE values with oms
describe("Calculation with PREFIXE vouchers with/without overage", () => {
  it("should calculate is tax exempt, PREFIXE voucher amount, payer hotel 100%, charge to room", async () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      }],
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(0.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(181.82); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(181.82);
    expect(totalVoucherPrice).toEqual(200.0);
  });

  it("should throw exception because of added modifiers", async () => {
    const t = () => {
      calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 2,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 100,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
    };

    expect(t).toThrow(Error);
  });

  it("should throw exception items without codes but vouchers added", async () => {
    const t = () => {
      validatePrefixePayload([{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [{
          id: 1,
          options: [
            {
              id: 1,
              price: 1,
              quantity: 1
            }
          ]
        }]
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: []
      }], [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]);
    };

    expect(t).toThrow(Error);
  });

  it("should throw exception because type is null", async () => {
    const t = () => {
      calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 2,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.ROOM_CHARGE,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 100,
          amountType: AmountType.FIXED,
          type: null,
          value: 200
        }]
      });
    };

    expect(t).toThrow(Error);
  });

  it("should not throw exception because modifiers are $0.0", async () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [{
          id: 1,
          options: [
            {
              id: 1,
              price: 0,
              quantity: 1
            }
          ]
        }],
        codeId: 1,
        ruleId: 1
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      }],
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(0.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(181.82); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(181.82);
    expect(totalVoucherPrice).toEqual(200.0);
  });

  it("should calculate with payer percentage null", async () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [{
          id: 1,
          options: [
            {
              id: 1,
              price: 0,
              quantity: 1
            }
          ]
        }],
        codeId: 1,
        ruleId: 1
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      }],
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: null,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(0.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(181.82); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(181.82);
    expect(totalVoucherPrice).toEqual(200.0);
  });

  it("should calculate is tax exempt, PREFIXE voucher amount, payer hotel 50%, charge to room", async () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      }],
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.ROOM_CHARGE,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(0.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(90.91);
    expect(totalVoucherPrice).toEqual(200.0);
  });

  it(
    "should throw exception is tax exempt, PREFIXE voucher amount, payer hotel 50%, charge to room with tip",
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          }],
          tip: 1,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.ROOM_CHARGE,
          discount: null,
          isTaxExempt: true,

          taxRate: 10,
          vouchers: [{
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 50,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 200
          }]
        });
      };
      expect(t).toThrow(Error);
    });

  it("should calculate is tax exempt, PREFIXE voucher amount, payer hotel 50%, card with tip", async () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: [],
        codeId: 1,
        ruleId: 1
      }],
      tip: 10,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: null,
      isTaxExempt: true,

      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.HOTEL,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 200
      }]
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice
    } = values;

    logValues(values);

    expect(receiptAmount).toEqual(0.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(10.0);
    expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(90.91);
    expect(totalVoucherPrice).toEqual(200.0);
  });

  it(
    "should calculate is tax exempt, PREFIXE voucher amount, payer hotel 50%, card with tip with overage case 1",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 1,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(1.0);
      expect(totalNet).toEqual(1.0);
      expect(taxAmount).toEqual(0.0);
      expect(totalGross).toEqual(1.0);
      expect(grandTotal).toEqual(11.0);
      expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
      expect(hotelTax).toEqual(0.0);
      expect(hotelGrandTotal).toEqual(90.91);
      expect(totalVoucherPrice).toEqual(200.0);
    });

  it(
    "should calculate is tax exempt, PREFIXE voucher amount, payer hotel 50%, card without tip with overage",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 1,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(1.0);
      expect(totalNet).toEqual(1.0);
      expect(taxAmount).toEqual(0.0);
      expect(totalGross).toEqual(1.0);
      expect(grandTotal).toEqual(1.0);
      expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
      expect(hotelTax).toEqual(0.0);
      expect(hotelGrandTotal).toEqual(90.91);
      expect(totalVoucherPrice).toEqual(200.0);
    });

  it(
    "should calculate is not tax exempt, PREFIXE voucher amount, payer hotel 50%, card without tip with overage",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 1,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(1.0);
      expect(totalNet).toEqual(1.0);
      expect(taxAmount).toEqual(0.1);
      expect(totalGross).toEqual(1.1);
      expect(grandTotal).toEqual(1.1);
      expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
      expect(hotelTax).toEqual(9.09);
      expect(hotelGrandTotal).toEqual(100.0);
      expect(totalVoucherPrice).toEqual(200.0);
    });

  it(
    "should calculate is tax exempt, PREFIXE voucher amount, payer hotel 50%, card with tip with overage case 2",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 4,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(4.0);
      expect(totalNet).toEqual(4.0);
      expect(taxAmount).toEqual(0.0);
      expect(totalGross).toEqual(4.0);
      expect(grandTotal).toEqual(14.0);
      expect(hotelTotalNet).toEqual(90.91); // todo: check/verify valus
      expect(hotelTax).toEqual(0.0);
      expect(hotelGrandTotal).toEqual(90.91);
      expect(totalVoucherPrice).toEqual(200.0);
    });

  it(
    "should calculate is not tax exempt, PREFIXE voucher amount, payer hotel 100%, card with tip with overage",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 4,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 3,
          price: 14,
          quantity: 2,
          modifiers: []
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.HOTEL,
          payerPercentage: 100,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PRE_FIXE,
          value: 200
        }]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      expect(receiptAmount).toEqual(32.0);
      expect(totalNet).toEqual(32.0);
      expect(taxAmount).toEqual(3.2);
      expect(totalGross).toEqual(35.2);
      expect(grandTotal).toEqual(45.2);
      expect(hotelTotalNet).toEqual(181.82); // todo: check/verify valus
      expect(hotelTax).toEqual(18.18);
      expect(hotelGrandTotal).toEqual(200.0);
      expect(totalVoucherPrice).toEqual(200.0);
    });

  it(
    "should throw exception because PREFIXE voucher not present",
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 4,
            modifiers: [{
              id: 1,
              options: [
                {
                  id: 1,
                  price: 1,
                  quantity: 1
                }
              ]
            }],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 3,
            price: 14,
            quantity: 2,
            modifiers: []
          }],
          tip: 10,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.CREDIT_CARD,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: []
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "should throw exception because more vouchers added and items have no rules",
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 4,
            modifiers: [{
              id: 1,
              options: [
                {
                  id: 1,
                  price: 1,
                  quantity: 1
                }
              ]
            }],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 3,
            price: 14,
            quantity: 2,
            modifiers: []
          }],
          tip: 10,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.CREDIT_CARD,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [{
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 200
          },
          {
            id: 2,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 300
          }]
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "is not tax exempt, PREFIXE voucher amount, payer hotel 100%, card with tip with overage, two PREFIXE vouchers",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 4,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 3,
          price: 14,
          quantity: 2,
          modifiers: []
        },
        {
          id: 4,
          price: 14,
          quantity: 2,
          modifiers: [],
          ruleId: 13,
          codeId: 4
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [
          {
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 200
          },
          {
            id: 2,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 100
          }
        ]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      // note: in oms the values are wrong when 2 different voucher programs are applied
      expect(receiptAmount).toEqual(32.0);
      expect(totalNet).toEqual(32.0);
      expect(taxAmount).toEqual(3.2);
      expect(totalGross).toEqual(35.2);
      expect(grandTotal).toEqual(45.2);
      expect(hotelTotalNet).toEqual(272.73); // todo: check/verify valus
      expect(hotelTax).toEqual(27.27);
      expect(hotelGrandTotal).toEqual(300.0);
      expect(totalVoucherPrice).toEqual(300.0);
    });

  it(
    `should throw exception because two different types of vouchers`,
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 4,
            modifiers: [{
              id: 1,
              options: [
                {
                  id: 1,
                  price: 1,
                  quantity: 1
                }
              ]
            }],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 3,
            price: 14,
            quantity: 2,
            modifiers: []
          },
          {
            id: 4,
            price: 14,
            quantity: 2,
            modifiers: [],
            ruleId: 13,
            codeId: 4
          }],
          tip: 10,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.CREDIT_CARD,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [
            {
              id: 1,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 200
            },
            {
              id: 2,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.DISCOUNT,
              value: 100
            }
          ]
        });
      };

      expect(t).toThrow(Error);
    });

  // note: this should be allowed since you can have the same program more than once
  it(
    "should throw exception because inconsistency between vouchers and items",
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 4,
            modifiers: [{
              id: 1,
              options: [
                {
                  id: 1,
                  price: 1,
                  quantity: 1
                }
              ]
            }],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 3,
            price: 14,
            quantity: 2,
            modifiers: []
          },
          {
            id: 4,
            price: 14,
            quantity: 2,
            modifiers: []
          }],
          tip: 10,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.CREDIT_CARD,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [
            {
              id: 1,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 200
            },
            {
              id: 1,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 100
            },
            {
              id: 1,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 100
            },
            {
              id: 2,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 100
            },
            {
              id: 2,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 100
            },
            {
              id: 3,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.FIXED,
              type: VoucherProgramType.PRE_FIXE,
              value: 100
            }
          ]
        });
      };

      expect(t).toThrow(Error);
    });

  it(
    "should calculate different payer percentage for prefixe voucher",
    async () => {
      const values = calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 4,
          modifiers: [{
            id: 1,
            options: [
              {
                id: 1,
                price: 1,
                quantity: 1
              }
            ]
          }],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 3,
          price: 14,
          quantity: 2,
          modifiers: []
        },
        {
          id: 4,
          price: 14,
          quantity: 2,
          modifiers: [],
          ruleId: 13,
          codeId: 4
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: false,

        taxRate: 10,
        vouchers: [
          {
            id: 1,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 100,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 200
          },
          {
            id: 2,
            payer: VoucherProgramPayer.HOTEL,
            payerPercentage: 50,
            amountType: AmountType.FIXED,
            type: VoucherProgramType.PRE_FIXE,
            value: 100
          }
        ]
      });
      const {
        receiptAmount,
        taxAmount,
        totalNet,
        totalGross,
        grandTotal,
        hotelTotalNet,
        hotelTax,
        hotelGrandTotal,
        totalVoucherPrice
      } = values;

      logValues(values);

      // note: in oms the values are wrong when 2 different voucher programs are applied
      expect(receiptAmount).toEqual(32.0);
      expect(totalNet).toEqual(32.0);
      expect(taxAmount).toEqual(3.2);
      expect(totalGross).toEqual(35.2);
      expect(grandTotal).toEqual(45.2);
      expect(hotelTotalNet).toEqual(227.27); // todo: check/verify valus
      expect(hotelTax).toEqual(22.73);
      expect(hotelGrandTotal).toEqual(250.0);
      expect(totalVoucherPrice).toEqual(300.0);
    });

  it(
    `should throw exception because PREFIXE supports only AMOUNT type`,
    async () => {
      const t = () => {
        calculate({
          items: [{
            id: 1,
            price: 14,
            quantity: 4,
            modifiers: [{
              id: 1,
              options: [
                {
                  id: 1,
                  price: 1,
                  quantity: 1
                }
              ]
            }],
            codeId: 1,
            ruleId: 1
          },
          {
            id: 2,
            price: 14,
            quantity: 2,
            modifiers: [],
            codeId: 2,
            ruleId: 2
          },
          {
            id: 3,
            price: 14,
            quantity: 2,
            modifiers: []
          },
          {
            id: 4,
            price: 14,
            quantity: 2,
            modifiers: []
          }],
          tip: 10,
          deliveryFee: DELIVERY_FEE_ZERO,
          paymentType: PaymentType.CREDIT_CARD,
          discount: null,
          isTaxExempt: false,

          taxRate: 10,
          vouchers: [
            {
              id: 1,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.PERCENTAGE,
              type: VoucherProgramType.PRE_FIXE,
              value: 200
            },
            {
              id: 2,
              payer: VoucherProgramPayer.HOTEL,
              payerPercentage: 100,
              amountType: AmountType.PERCENTAGE,
              type: VoucherProgramType.PRE_FIXE,
              value: 200
            }
          ]
        });
      };

      expect(t).toThrow(Error);
    });
});

describe("Edge cases uncovered", () => {
  it("should throw exception because vouchers is null, and items have codeId", () => {
    const t = () => {
      calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: [],
          codeId: 1,
          ruleId: 1
        }],
        tip: 10,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        discount: null,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: null
      });
    };
    expect(t).toThrow(Error);
  });

  it("should calculate even though discount is greater than receipt amount", () => {
    const values = calculate({
      items: [{
        id: 1,
        price: 14,
        quantity: 2,
        modifiers: []
      },
      {
        id: 2,
        price: 14,
        quantity: 2,
        modifiers: []
      }],
      tip: 0,
      deliveryFee: DELIVERY_FEE_ZERO,
      paymentType: PaymentType.CREDIT_CARD,
      discount: {
        type: PriceMeasurementType.PERCENTAGE,
        value: 120,
        valueUsed: 0
      },
      isTaxExempt: true,
      taxRate: 10,
      vouchers: null
    });
    const {
      receiptAmount,
      taxAmount,
      totalNet,
      totalGross,
      grandTotal,
      hotelTotalNet,
      hotelTax,
      hotelGrandTotal,
      totalVoucherPrice,
      discount
    } = values;

    logValues(values);

    // note: in oms the values are wrong when 2 different voucher programs are applied
    expect(receiptAmount).toEqual(56.0);
    expect(totalNet).toEqual(0.0);
    expect(taxAmount).toEqual(0.0);
    expect(totalGross).toEqual(0.0);
    expect(grandTotal).toEqual(0.0);
    expect(hotelTotalNet).toEqual(0.0); // todo: check/verify valus
    expect(hotelTax).toEqual(0.0);
    expect(hotelGrandTotal).toEqual(0.0);
    expect(totalVoucherPrice).toEqual(0.0);
    expect(discount).toEqual(56.0);
  });

  it("should throw exception if another payment type", () => {
    const t = () => {
      calculate({
        items: [{
          id: 1,
          price: 14,
          quantity: 2,
          modifiers: []
        },
        {
          id: 2,
          price: 14,
          quantity: 2,
          modifiers: []
        }],
        tip: 10,
        // @ts-ignore
        paymentType: "something else",
        isTaxExempt: true,

        taxRate: 10,
        vouchers: null
      });
    };
    expect(t).toThrow(Error);
  });

  it("should throw exception because no overage and payment type is card", () => {
    const t = () => {
      calculate({
        items: [{
          id: 1,
          price: 0,
          quantity: 2,
          modifiers: []
        },
        {
          id: 2,
          price: 0,
          quantity: 2,
          modifiers: []
        }],
        tip: 0,
        deliveryFee: DELIVERY_FEE_ZERO,
        paymentType: PaymentType.CREDIT_CARD,
        isTaxExempt: true,

        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.ALFRED_PROGRAM,
          payerPercentage: 100,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.DISCOUNT,
          value: 0
        }]
      });
    };
    expect(t).toThrow(Error);
  });

  it("should get value with tax", () => {
    const val1 = getValueWithTax(10, new Decimal(14));
    const val2 = getValueWithTax(8.889, new Decimal(21));
    const val3 = getValueWithTax(2, new Decimal(14));
    const val4 = getValueWithTax(4, new Decimal(21));
    const val5 = getValueWithTax(1, new Decimal(14));
    const val6 = getValueWithTax(0, new Decimal(21));
    const val7 = getValueWithTax(12, new Decimal(14));
    const val8 = getValueWithTax(15, new Decimal(21));
    const val9 = getValueWithTax(4.122, new Decimal(21));

    expect(val1.toDecimalPlaces(2)).toEqual(new Decimal(15.40));
    expect(val2.toDecimalPlaces(2)).toEqual(new Decimal(22.87));
    expect(val3.toDecimalPlaces(2)).toEqual(new Decimal(14.28));
    expect(val4.toDecimalPlaces(2)).toEqual(new Decimal(21.84));
    expect(val5.toDecimalPlaces(2)).toEqual(new Decimal(14.14));
    expect(val6.toDecimalPlaces(2)).toEqual(new Decimal(21.00));
    expect(val7.toDecimalPlaces(2)).toEqual(new Decimal(15.68));
    expect(val8.toDecimalPlaces(2)).toEqual(new Decimal(24.15));
    expect(val9.toDecimalPlaces(2)).toEqual(new Decimal(21.87));
  });

  it("should calculate revenue", () => {
    const val1 = calculateRevenue(new Decimal(1), new Decimal(14));
    const val2 = calculateRevenue(new Decimal(80), new Decimal(21));
    const val3 = calculateRevenue(new Decimal(22.3), new Decimal(14));
    const val4 = calculateRevenue(new Decimal(0), new Decimal(21));
    const val5 = calculateRevenue(new Decimal(22.07), new Decimal(14));
    const val6 = calculateRevenue(new Decimal(0.42), new Decimal(50.10));
    const val7 = calculateRevenue(new Decimal(1), new Decimal(14));

    expect(val1.toDecimalPlaces(2)).toEqual(new Decimal(-13.0));
    expect(val2.toDecimalPlaces(2)).toEqual(new Decimal(59.0));
    expect(val3.toDecimalPlaces(2)).toEqual(new Decimal(8.3));
    expect(val4.toDecimalPlaces(2)).toEqual(new Decimal(-21));
    expect(val5.toDecimalPlaces(2)).toEqual(new Decimal(8.07));
    expect(val6.toDecimalPlaces(2)).toEqual(new Decimal(-49.68));
    expect(val7.toDecimalPlaces(2)).toEqual(new Decimal(-13));
  });
});

describe("Calculation with refunds", () => {
  it("should calculate refund with overage with PER_DIEM voucher", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 836
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(400.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(0.0);
    expect(newHotelGrandTotal).toEqual(0.0);
    expect(newHotelTax).toEqual(0.0);
    expect(newHotelTotalNet).toEqual(0.0);
  });

  it("should calculate refund with overage with PER_DIEM voucher null payer percentage count as full", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 836
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: null,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(400.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(0.0);
    expect(newHotelGrandTotal).toEqual(0.0);
    expect(newHotelTax).toEqual(0.0);
    expect(newHotelTotalNet).toEqual(0.0);
  });

  it("should calculate refund with percentage with overage with PER_DIEM voucher", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.PERCENTAGE,
        value: 100
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(400.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(0.0);
    expect(newHotelGrandTotal).toEqual(0.0);
    expect(newHotelTax).toEqual(0.0);
    expect(newHotelTotalNet).toEqual(0.0);
  });

  it("should calculate refund with overage with discount voucher", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 836
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.DISCOUNT,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(0.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(400.0);
    expect(newHotelGrandTotal).toEqual(400);
    expect(newHotelTax).toEqual(36.36);
    expect(newHotelTotalNet).toEqual(363.64);
  });

  it("should calculate refund with overage with PREFIXE voucher", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 836
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PRE_FIXE,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(0.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(400.0);
    expect(newHotelGrandTotal).toEqual(400);
    expect(newHotelTax).toEqual(36.36);
    expect(newHotelTotalNet).toEqual(363.64);
  });

  it("should calculate refund with overage without voucher full refund", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 436
      },
      grandTotal: 436.0,
      totalVoucherPrice: 0,
      hotelGrandTotal: 0,
      taxRate: 10,
      vouchers: null
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });
    expect(newGrandTotal).toEqual(0.0);
    expect(refundedTotalVoucherPrice).toEqual(0.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(0.0);
    expect(newHotelGrandTotal).toEqual(0);
    expect(newHotelTax).toEqual(0);
    expect(newHotelTotalNet).toEqual(0);
  });

  it("should calculate refund with overage without voucher partial refund", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 200
      },
      grandTotal: 436.0,
      totalVoucherPrice: 0,
      hotelGrandTotal: 0,
      taxRate: 10,
      vouchers: null
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });
    expect(newGrandTotal).toEqual(236.0);
    expect(refundedTotalVoucherPrice).toEqual(0.0);
    expect(refundedGrandTotal).toEqual(200.0);
    expect(newTotalVoucherPrice).toEqual(0.0);
    expect(newHotelGrandTotal).toEqual(0);
    expect(newHotelTax).toEqual(0);
    expect(newHotelTotalNet).toEqual(0);
  });

  it("should calculate refund with overage with PER_DIEM voucher partial refund", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 200
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 400,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 100,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    console.log({
      newHotelGrandTotal: newHotelGrandTotal.toFixed(2),
      newHotelTax: newHotelTax.toFixed(2),
      newHotelTotalNet: newHotelTotalNet.toFixed(2)
    });

    expect(newGrandTotal).toEqual(236.0);
    expect(refundedTotalVoucherPrice).toEqual(0.0);
    expect(refundedGrandTotal).toEqual(200.0);
    expect(newTotalVoucherPrice).toEqual(400.0);
    expect(newHotelGrandTotal).toEqual(400);
    expect(newHotelTax).toEqual(36.36);
    expect(newHotelTotalNet).toEqual(363.64);
  });

  it("should calculate refund with overage with PER_DIEM voucher partial refund 1 todo", async () => {
    const values = calculateRefund({
      refund: {
        type: PriceMeasurementType.FIXED,
        value: 500
      },
      grandTotal: 436.0,
      totalVoucherPrice: 400,
      hotelGrandTotal: 200,
      taxRate: 10,
      vouchers: [{
        id: 1,
        payer: VoucherProgramPayer.ALFRED_PROGRAM,
        payerPercentage: 50,
        amountType: AmountType.FIXED,
        type: VoucherProgramType.PER_DIEM,
        value: 0
      }]
    });
    const {
      newGrandTotal,
      refundedTotalVoucherPrice,
      refundedGrandTotal,
      newTotalVoucherPrice,
      newHotelGrandTotal,
      newHotelTax,
      newHotelTotalNet
    } = values;

    expect(newGrandTotal).toEqual(0);
    expect(refundedTotalVoucherPrice).toEqual(64.0);
    expect(refundedGrandTotal).toEqual(436.0);
    expect(newTotalVoucherPrice).toEqual(336.0);
    expect(newHotelGrandTotal).toEqual(168.0);
    expect(newHotelTax).toEqual(15.27);
    expect(newHotelTotalNet).toEqual(152.73);
  });

  it("should throw error calculating refund because value is greater than total", async () => {
    const t = () => {
      calculateRefund({
        refund: {
          type: PriceMeasurementType.FIXED,
          value: 500
        },
        grandTotal: 436.0,
        totalVoucherPrice: 40,
        hotelGrandTotal: 20,
        taxRate: 10,
        vouchers: [{
          id: 1,
          payer: VoucherProgramPayer.ALFRED_PROGRAM,
          payerPercentage: 50,
          amountType: AmountType.FIXED,
          type: VoucherProgramType.PER_DIEM,
          value: 0
        }]
      });
    };
    expect(t).toThrow(Error);
  });
});
