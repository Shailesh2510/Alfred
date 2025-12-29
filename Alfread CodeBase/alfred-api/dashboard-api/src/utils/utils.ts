import { isAfter, isBefore } from "date-fns";

export function findShortestDeliveryDuration(deliveryOptions) {
  const validOptions = deliveryOptions.filter(
    (option) => option.deliveryDuration != null && option.name != "Shipday"
  );

  return validOptions.reduce((shortestOption, currentOption) => {
    if (
      !shortestOption ||
      currentOption.deliveryDuration < shortestOption.deliveryDuration
    ) {
      return currentOption;
    }
    return shortestOption;
  }, null);
}

export function transformOrderItems(apiItems: any[]) {
  return apiItems.map((item) => {
    const basePrice = parseFloat(item.price);
    const modifierPrices = item.modifiers
      .flatMap((modifier) => modifier.options)
      .reduce((total, option) => total + parseFloat(option.price || "0"), 0);

    const totalUnitPrice = basePrice + modifierPrices;

    return {
      name: item.itemName,
      unitPrice: totalUnitPrice,
      quantity: item.quantity,
      addOns: item.modifiers
        .flatMap((modifier) => modifier.options)
        .map((option) => option.modifierOptionName),
    };
  });
}

export function isWithInOverNightTimeRange(
  isShipdayAllDayDeliveryEnabled: boolean,
  date: any
) {
  const currentTime = new Date(date).getTime();
  const startTime = new Date().setHours(3, 15, 0);
  const endTime = new Date().setHours(12, 0, 0);

  const isOutsideTimeRange =
    isAfter(currentTime, startTime) && isBefore(currentTime, endTime);
  console.log(
    "create order shipday calculation",
    JSON.stringify({
      currentDateValue: new Date(),
      currentTime: new Date(date),
      startTime: `${startTime} ( ${currentTime > startTime})`,
      endTime: `${endTime} ( ${currentTime < endTime})`,
      isOutsideTimeRange: isOutsideTimeRange,
    })
  );
  return isShipdayAllDayDeliveryEnabled || isOutsideTimeRange;
}

export function fetchFeatureFlagValue(
  featureFlagsObject: any,
  featureFlagKey: string
): boolean {
  if (featureFlagsObject[featureFlagKey]?.enabled) {
    return featureFlagsObject[featureFlagKey].value;
  }
  return false;
}
