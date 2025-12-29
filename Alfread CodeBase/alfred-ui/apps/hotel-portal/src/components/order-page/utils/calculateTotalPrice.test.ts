import { expect, it, describe, jest } from "@jest/globals"

import calculateTotalPrice from "./calculateTotalPrice"

describe("calculateTotalPrice", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	const taxRate = 8.875
	const deliveryFee = 5.49

	it("should return the correct total price when there is no delivery fee", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = false

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("0.00")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("0.00")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("10.89")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("10.89")
	})

	it("should return the correct total price when there is a delivery fee", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = true

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("16.38")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("16.38")
	})

	it("should return the correct total price when there is a DISCOUNT PERCENTAGE voucher", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "PERCENTAGE",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("1.00")
		expect(result.subTotalPrice).toBe("9.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.80")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("15.29")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("15.29")
	})

	it("should return the correct total price when there is a DISCOUNT FIXED voucher", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "FIXED",
			total_amount: 2
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("14.38")
		expect(result.totalDifference).toBe("2.00")
		expect(result.undiscountedTotalPrice).toBe("16.38")
	})

	it("should return the correct total price when there is a PER DIEM FIXED voucher", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "PER_DIEM",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("6.38")
		expect(result.totalDifference).toBe("10.00")
		expect(result.undiscountedTotalPrice).toBe("16.38")
	})

	it("should return the correct total price when there is a PER DIEM FIXED voucher and the total price is less than the voucher amount", () => {
		const items = [{ id: 1, price: 3.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "PER_DIEM",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("3.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("3.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.27")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("0.00")
		expect(result.totalDifference).toBe("8.76")
		expect(result.undiscountedTotalPrice).toBe("8.76")
	})

	it("should return the correct total price when there is a DISCOUNT FIXED voucher and the total price is less than the voucher amount", () => {
		const items = [{ id: 1, price: 3.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "FIXED",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("3.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("3.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.27")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("0.00")
		expect(result.totalDifference).toBe("8.76")
		expect(result.undiscountedTotalPrice).toBe("8.76")
	})

	it("should return the correct total price when there is a 100% DISCOUNT PERCENTAGE voucher", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const hasDeliveryFee = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "PERCENTAGE",
			total_amount: 100
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("10.00")
		expect(result.subTotalPrice).toBe("0.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.00")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("5.49")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("5.49")
	})

	it("should return the correct total price when same place delivery and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = true
		const hasDeliveryFee = false
		const isMandatoryTipEnabled = true

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("0.00")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("1.00")
		expect(result.calculatedTip).toBe("1.00")
		expect(result.totalPrice).toBe("11.89")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("11.89")
	})

	it("should return the correct total price when same place delivery and mandatory tip disabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = true
		const hasDeliveryFee = false
		const isMandatoryTipEnabled = false

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("0.00")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("0.00")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("10.89")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("10.89")
	})

	it("should return the correct total price when different place delivery, no voucher, and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = false
		const hasDeliveryFee = true
		const isMandatoryTipEnabled = true
		const voucher = null

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("16.38")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("16.38")
	})

	it("should return the correct total price when different place delivery, with DISCOUNT FIXED voucher, and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = false
		const hasDeliveryFee = true
		const isMandatoryTipEnabled = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "FIXED",
			total_amount: 2
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.99")
		expect(result.calculatedTip).toBe("0.50")
		expect(result.totalPrice).toBe("14.88")
		expect(result.totalDifference).toBe("2.00")
		expect(result.undiscountedTotalPrice).toBe("16.88")
	})

	it("should return the correct total price when different place delivery, with DISCOUNT PERCENTAGE voucher, and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = false
		const hasDeliveryFee = true
		const isMandatoryTipEnabled = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "PERCENTAGE",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("1.00")
		expect(result.subTotalPrice).toBe("9.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.80")
		expect(result.serviceFee).toBe("5.94")
		expect(result.calculatedTip).toBe("0.45")
		expect(result.totalPrice).toBe("15.74")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("15.74")
	})

	it("should return the correct total price when different place delivery, with PER DIEM FIXED voucher, and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = false
		const hasDeliveryFee = true
		const isMandatoryTipEnabled = true
		const voucher = {
			type: "PER_DIEM",
			total_amount: 10
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.99")
		expect(result.calculatedTip).toBe("0.50")
		expect(result.totalPrice).toBe("6.88")
		expect(result.totalDifference).toBe("10.00")
		expect(result.undiscountedTotalPrice).toBe("16.88")
	})

	it("should return the correct total price when different place delivery, with 100% DISCOUNT PERCENTAGE voucher, and mandatory tip enabled", () => {
		const items = [{ id: 1, price: 10.0, quantity: 1 }]
		const isDeliveryInSamePlace = false
		const hasDeliveryFee = true
		const isMandatoryTipEnabled = true
		const voucher = {
			type: "DISCOUNT",
			amount_type: "PERCENTAGE",
			total_amount: 100
		}

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			isDeliveryInSamePlace,
			isMandatoryTipEnabled,
			voucher
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("10.00")
		expect(result.subTotalPrice).toBe("0.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.00")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("5.49")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("5.49")
	})

	it("should return the correct total price for items with modifiers", () => {
		const items = [
			{
				id: 1,
				price: 10.0,
				quantity: 1,
				modifiers: [
					{
						options: [{ price: 1.0 }, { price: 2.0 }]
					}
				]
			}
		]
		const hasDeliveryFee = true

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee
		})

		expect(result.undiscountedSubTotalPrice).toBe("13.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("13.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("1.15")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("19.64")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("19.64")
	})

	it("should return the correct total price for items with tip", () => {
		const items = [
			{
				id: 1,
				price: 10.0,
				quantity: 1
			}
		]
		const hasDeliveryFee = true
		const tip = 1.0

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee,
			tip
		})

		expect(result.undiscountedSubTotalPrice).toBe("10.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("10.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.89")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("17.38")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("16.38")
	})

	it("should return the correct total price for items with no ID (invalid item)", () => {
		const items = [
			{
				price: 10.0,
				quantity: 1
			}
		]
		const hasDeliveryFee = true

		const result = calculateTotalPrice({
			items,
			taxRate,
			hasDeliveryFee,
			deliveryFee
		})

		expect(result.undiscountedSubTotalPrice).toBe("0.00")
		expect(result.subTotalDifference).toBe("0.00")
		expect(result.subTotalPrice).toBe("0.00")
		expect(result.deliveryFee).toBe("5.49")
		expect(result.taxAmount).toBe("0.00")
		expect(result.serviceFee).toBe("5.49")
		expect(result.calculatedTip).toBe("0.00")
		expect(result.totalPrice).toBe("5.49")
		expect(result.totalDifference).toBe("0.00")
		expect(result.undiscountedTotalPrice).toBe("5.49")
	})
})
