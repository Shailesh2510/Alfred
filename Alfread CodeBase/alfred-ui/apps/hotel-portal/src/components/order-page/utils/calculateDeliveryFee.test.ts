import { calculateDeliveryFee } from "./calculateDeliveryFee"
import { DEFAULT_DELIVERY_FEE_AMOUNT_USD } from "@/shared-constants"

describe("calculateDeliveryFee", () => {
	it("should return shipdayDeliveryFee if hasDeliveryFee and merchantThirdPartyDelivery and shipdayDeliveryFee > 0", () => {
		const result = calculateDeliveryFee(true, true, 5, 10)
		expect(result).toBe(5)
	})

	it("should return hotelDeliveryFee if hasDeliveryFee and merchantThirdPartyDelivery and shipdayDeliveryFee <= 0", () => {
		const result = calculateDeliveryFee(true, true, 0, 10)
		expect(result).toBe(10)
	})

	it("should return DEFAULT_DELIVERY_FEE_AMOUNT_USD if hasDeliveryFee and not merchantThirdPartyDelivery", () => {
		const result = calculateDeliveryFee(true, false, 5, 10)
		expect(result).toBe(DEFAULT_DELIVERY_FEE_AMOUNT_USD)
	})

	it("should return hotelDeliveryFee if not hasDeliveryFee", () => {
		const result = calculateDeliveryFee(false, true, 5, 10)
		expect(result).toBe(10)
	})
})
