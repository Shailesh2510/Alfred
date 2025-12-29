import { VOUCHER_TYPES, DISCOUNT_VOUCHER_TYPE } from "@/shared-constants"

const calculateTotalPrice = ({
	items,
	voucher = null,
	deliveryFee = 0,
	isTaxExempt = false,
	hasDeliveryFee,
	taxRate = 0,
	tip = 0,
	isMandatoryTipEnabled = false,
	isDeliveryInSamePlace = false
}: any) => {
	let taxAmount = 0
	let totalPrice = 0
	let subTotalPrice = 0
	let totalDifference = 0
	let subTotalDifference = 0
	let unDiscountedTotalPrice = 0
	let unDiscountedSubTotalPrice = 0
	let additionalTip = 0
	let serviceFee = 0

	if (!hasDeliveryFee) {
		deliveryFee = 0
	}

	subTotalPrice = items?.reduce((total: any, item: any) => {
		if (item?.id) {
			return (
				total +
				(parseFloat(item?.price) +
					(item?.modifiers?.reduce((totalModifiers: any, modifier: any) => {
						return (
							totalModifiers +
							(modifier?.options?.reduce((totalOptions: any, option: any) => {
								return totalOptions + parseFloat(option?.price)
							}, 0) || 0)
						)
					}, 0) || 0)) *
					parseInt(item?.quantity)
			)
		}
		return total
	}, 0)
	unDiscountedSubTotalPrice = subTotalPrice

	if (
		voucher &&
		voucher?.type === VOUCHER_TYPES.DISCOUNT.value &&
		voucher?.amount_type === DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value
	) {
		subTotalPrice =
			subTotalPrice - subTotalPrice * (parseFloat(voucher?.total_amount) / 100)
	}

	totalPrice = subTotalPrice

	if (!isTaxExempt && taxRate) {
		taxAmount = totalPrice * (taxRate / 100)
		totalPrice += taxAmount
	}

	totalPrice += deliveryFee

	if (isDeliveryInSamePlace && isMandatoryTipEnabled) {
		additionalTip = (subTotalPrice * 10) / 100
		totalPrice += additionalTip
	} else if (voucher && isMandatoryTipEnabled) {
		additionalTip = (subTotalPrice * 5) / 100
		totalPrice += additionalTip
	}

	unDiscountedTotalPrice = totalPrice

	if (voucher && voucher?.type === VOUCHER_TYPES.DISCOUNT.value) {
		if (voucher?.amount_type === DISCOUNT_VOUCHER_TYPE.FIXED.value) {
			if (parseFloat(voucher?.total_amount) < totalPrice) {
				totalPrice = totalPrice - parseFloat(voucher?.total_amount)
			} else {
				totalPrice = 0
			}
		}
	}

	if (voucher && voucher?.type === VOUCHER_TYPES.PER_DIEM.value) {
		const remainingAmount =
			parseFloat(voucher?.total_amount) - parseFloat(voucher?.amount_used ?? 0)
		if (remainingAmount < totalPrice) {
			totalPrice = totalPrice - remainingAmount
		} else {
			totalPrice = 0
		}
	}

	totalDifference = unDiscountedTotalPrice - totalPrice
	subTotalDifference = unDiscountedSubTotalPrice - subTotalPrice

	if (tip) {
		totalPrice = totalPrice + parseFloat(tip)
	}

	serviceFee = additionalTip + (hasDeliveryFee ? parseFloat(deliveryFee) : 0)

	return {
		taxAmount: taxAmount?.toFixed(2),
		totalPrice: totalPrice?.toFixed(2),
		subTotalPrice: subTotalPrice?.toFixed(2),
		totalDifference: totalDifference?.toFixed(2),
		subTotalDifference: subTotalDifference?.toFixed(2),
		undiscountedTotalPrice: unDiscountedTotalPrice?.toFixed(2),
		deliveryFee: deliveryFee?.toFixed(2),
		calculatedTip: additionalTip.toFixed(2),
		undiscountedSubTotalPrice: unDiscountedSubTotalPrice?.toFixed(2),
		serviceFee: serviceFee.toFixed(2)
	}
}

export default calculateTotalPrice
