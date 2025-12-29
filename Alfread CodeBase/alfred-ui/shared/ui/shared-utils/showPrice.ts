import { toNumber } from "lodash";

const showPrice = (price: string | number) => {
  return `$${toNumber(price).toFixed(2)}`;
};

export default showPrice;
