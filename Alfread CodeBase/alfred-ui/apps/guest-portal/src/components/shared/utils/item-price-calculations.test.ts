import {
	calculateTotalModifierPrice,
	calculateItemSubtotal,
	calculateModifierPrice
} from "./item-price-calculations"

describe("calculateTotalModifierPrice", () => {
	it("should return 0 when no modifiers are provided", () => {
		expect(calculateTotalModifierPrice([])).toBe(0)
	})

	it("should return 0 when undefined is provided", () => {
		expect(calculateTotalModifierPrice(undefined)).toBe(0)
	})

	it("should sum all modifier prices correctly", () => {
		const modifiers = [{ price: 1.5 }, { price: 2.0 }, { price: 0.75 }]
		expect(calculateTotalModifierPrice(modifiers)).toBe(4.25)
	})

	it("should handle modifiers with no price property", () => {
		const modifiers = [{ price: 1.5 }, {}, { price: 0.75 }]
		expect(calculateTotalModifierPrice(modifiers)).toBe(2.25)
	})

	it("should handle modifiers with null or undefined prices", () => {
		const modifiers = [
			{ price: 1.5 },
			{ price: null },
			{ price: undefined },
			{ price: 0.75 }
		]
		expect(calculateTotalModifierPrice(modifiers)).toBe(2.25)
	})
})

describe("calculateItemSubtotal", () => {
	it("should calculate subtotal with no modifiers", () => {
		const result = calculateItemSubtotal({
			productPrice: 10,
			productQuantity: 2,
			productModifierOptions: []
		})
		expect(result).toBe(20)
	})

	it("should calculate subtotal with modifiers", () => {
		const result = calculateItemSubtotal({
			productPrice: 10,
			productQuantity: 2,
			productModifierOptions: [{ price: 1.5 }, { price: 0.75 }]
		})
		expect(result).toBe(24.5) // (10 + 1.50 + 0.75) * 2
	})

	it("should handle zero quantity", () => {
		const result = calculateItemSubtotal({
			productPrice: 10,
			productQuantity: 0,
			productModifierOptions: [{ price: 1.5 }]
		})
		expect(result).toBe(0)
	})

	it("should use default values for empty object", () => {
		const result = calculateItemSubtotal({
			productPrice: 0,
			productQuantity: 0,
			productModifierOptions: []
		})
		expect(result).toBe(0)
	})
})

describe("calculateModifierPrice", () => {
	it("should calculate modifier price correctly", () => {
		expect(calculateModifierPrice(1.5, 2)).toBe(3.0)
	})

	it("should return 0 when price is undefined", () => {
		expect(calculateModifierPrice(undefined, 2)).toBe(0)
	})

	it("should return 0 when quantity is undefined", () => {
		expect(calculateModifierPrice(1.5, undefined)).toBe(0)
	})

	it("should return 0 when both parameters are undefined", () => {
		expect(calculateModifierPrice(undefined, undefined)).toBe(0)
	})

	it("should handle zero quantity", () => {
		expect(calculateModifierPrice(1.5, 0)).toBe(0)
	})

	it("should handle zero price", () => {
		expect(calculateModifierPrice(0, 2)).toBe(0)
	})
})
