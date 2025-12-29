import { DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD } from '../constants'

export const calculateDeliveryFee = (
	hasDeliveryFee: boolean,
	merchantThirdPartyDelivery: boolean,
	deliveryFee: number,
	hotelDeliveryFee: number
) => {
	if (hasDeliveryFee && merchantThirdPartyDelivery) {
		return deliveryFee > 0 ? deliveryFee : hotelDeliveryFee
	} else if (hasDeliveryFee && !merchantThirdPartyDelivery) {
		return DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD
	}
	return hotelDeliveryFee
}
