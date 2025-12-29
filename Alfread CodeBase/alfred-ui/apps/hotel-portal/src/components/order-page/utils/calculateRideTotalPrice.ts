import { VOUCHER_TYPES, DISCOUNT_VOUCHER_TYPE } from "@/shared-constants"

const calculateRideTotalPrice = ({ items, voucher }: any) => {
	let totalPrice = 0
	let subTotalPrice = 0
	let totalDifference = 0
	let unDiscountedTotalPrice = 0

	subTotalPrice = items?.price

	totalPrice = subTotalPrice
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

	return {
		totalPrice: totalPrice?.toFixed(2),
		subTotalPrice: subTotalPrice?.toFixed(2),
		totalDifference: totalDifference?.toFixed(2)
	}
}

export default calculateRideTotalPrice
