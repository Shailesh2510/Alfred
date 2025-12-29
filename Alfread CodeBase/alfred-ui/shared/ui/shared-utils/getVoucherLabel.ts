import { VOUCHER_TYPES } from "../shared-constants";

const getVoucherLabel = (voucherCode: string) => {
  if (voucherCode && VOUCHER_TYPES[voucherCode]) {
    return VOUCHER_TYPES[voucherCode].label;
  }
  return "UNKNOWN VOUCHER";
};

export default getVoucherLabel;
