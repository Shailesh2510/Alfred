import { DEFAULT_DELIVERY_FEE_AMOUNT_USD } from "@/shared-constants"

export const calculateDeliveryFee = (
	hasDeliveryFee: boolean,
	merchantThirdPartyDelivery: boolean,
	shipdayDeliveryFee: number,
	hotelDeliveryFee: number
) => {
	if (hasDeliveryFee && merchantThirdPartyDelivery) {
		return shipdayDeliveryFee > 0 ? shipdayDeliveryFee : hotelDeliveryFee
	} else if (hasDeliveryFee && !merchantThirdPartyDelivery) {
		return DEFAULT_DELIVERY_FEE_AMOUNT_USD
	}
	return hotelDeliveryFee
}
