import { expect, it, describe, jest } from "@jest/globals"

import { 
    findShortestDeliveryDuration, 
    transformOrderItems, 
    isWithInOverNightTimeRange,
    fetchFeatureFlagValue
} from "./utils"

describe("findShortestDeliveryDuration", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const deliveryOptions = [
        {
            id: "1",
            name: "DoorDash",
            fee: 6.99,
            pickupTime: "2024-11-17T15:56:06Z",
            deliveryTime: "2024-11-17T16:40:16Z",
            pickupDuration: 12,
            deliveryDuration: 56,
            error: false,
            errorCode: null,
            errorMessage: null,
            errorDescription: null,
            isProd: false,
            isInternal: false,
            probableAssignment: false,
            minBillableFee: null
        },
        {
            id: null,
            name: "Relay [Beta]",
            fee: null,
            pickupTime: null,
            deliveryTime: null,
            pickupDuration: null,
            deliveryDuration: null,
            error: true,
            errorCode: null,
            errorMessage: "No service available",
            errorDescription: "Relay Delivery Check Exception, reason not specified, status code: 403",
            isProd: false,
            isInternal: false,
            probableAssignment: false,
            minBillableFee: null
        },
        {
            id: null,
            name: "Roadie",
            fee: 21.74,
            pickupTime: "2024-11-17T16:43:54Z",
            deliveryTime: "2024-11-17T18:13:53Z",
            pickupDuration: 60,
            deliveryDuration: 149,
            error: false,
            errorCode: null,
            errorMessage: null,
            errorDescription: null,
            isProd: false,
            isInternal: false,
            probableAssignment: false,
            minBillableFee: null
        },
        {
            id: "dqt_zLKPSHN1Snis5zfTywoQVg",
            name: "Uber",
            fee: 6.49,
            pickupTime: "2024-11-17T15:59:53Z",
            deliveryTime: "2024-11-17T16:28:05Z",
            pickupDuration: 16,
            deliveryDuration: 44,
            error: false,
            errorCode: null,
            errorMessage: null,
            errorDescription: null,
            isProd: false,
            isInternal: false,
            probableAssignment: false,
            minBillableFee: null
        },
        {
            id: null,
            name: "Shipday",
            fee: 5.0,
            pickupTime: "2024-11-17T16:06:54Z",
            deliveryTime: "2024-11-17T16:28:54Z",
            pickupDuration: 23,
            deliveryDuration: 45,
            error: false,
            errorCode: null,
            errorMessage: null,
            errorDescription: null,
            isProd: false,
            isInternal: false,
            probableAssignment: true,
            minBillableFee: null
        }
    ]

    it("should return the shortest delivery duration", () => {

        const expected = {
            id: "dqt_zLKPSHN1Snis5zfTywoQVg",
            name: "Uber",
            fee: 6.49,
            pickupTime: "2024-11-17T15:59:53Z",
            deliveryTime: "2024-11-17T16:28:05Z",
            pickupDuration: 16,
            deliveryDuration: 44,
            error: false,
            errorCode: null,
            errorMessage: null,
            errorDescription: null,
            isProd: false,
            isInternal: false,
            probableAssignment: false,
            minBillableFee: null
        }

        const result = findShortestDeliveryDuration(deliveryOptions)

        expect(result).toEqual(expected)
    })
})

describe("transformOrderItems", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const apiItems = [
        {
            id: 17346,
            orderId: 8495,
            itemId: 77,
            itemName: "Chicken Parmesan",
            price: 14.00000,
            quantity: 1,
            voucherCode: null,
            voucherCodeId: null,
            modifiers: [
                {
                    id: 5819,
                    orderId: 8495,
                    modifierName: "Sauce",
                    orderItemId: 17346,
                    itemId: 77,
                    modifierId: 23,
                    options: [
                        {
                            id: 6134,
                            orderId: 8495,
                            orderItemId: 17346,
                            orderItemModifierId: 5819,
                            modifierOptionName: "Marinara",
                            quantity: 1,
                            price: 0.00000,
                            itemId: 77,
                            modifierId: 23,
                            modifierName: "Sauce",
                            modifierOptionId: 22
                        }
                    ]
                },
                {
                    id: 5820,
                    orderId: 8495,
                    modifierName: "Side",
                    orderItemId: 17346,
                    itemId: 77,
                    modifierId: 24,
                    options: [
                        {
                            id: 6135,
                            orderId: 8495,
                            orderItemId: 17346,
                            orderItemModifierId: 5820,
                            modifierOptionName: "Fries",
                            quantity: 1,
                            price: 2.00000,
                            itemId: 77,
                            modifierId: 24,
                            modifierName: "Side",
                            modifierOptionId: 23
                        }
                    ]
                }
            ]
        },
        {
            id: 17347,
            orderId: 8495,
            itemId: 78,
            itemName: "Cheeseburger",
            price: 12.00000,
            quantity: 2,
            voucherCode: null,
            voucherCodeId: null,
            modifiers: [
                {
                    id: 5821,
                    orderId: 8495,
                    modifierName: "Cheese",
                    orderItemId: 17347,
                    itemId: 78,
                    modifierId: 25,
                    options: [
                        {
                            id: 6136,
                            orderId: 8495,
                            orderItemId: 17347,
                            orderItemModifierId: 5821,
                            modifierOptionName: "Cheddar",
                            price: 0.00000,
                            itemId: 78,
                            modifierId: 25,
                            modifierName: "Cheese",
                            modifierOptionId: 24
                        }
                    ]
                },
                {
                    id: 5822,
                    orderId: 8495,
                    modifierName: "Side",
                    orderItemId: 17347,
                    itemId: 78,
                    modifierId: 26,
                    options: [
                        {
                            id: 6137,
                            orderId: 8495,
                            orderItemId: 17347,
                            orderItemModifierId: 5822,
                            modifierOptionName: "Onion Rings",
                            price: 3.00000,
                            itemId: 78,
                            modifierId: 26,
                            modifierName: "Side",
                            modifierOptionId: 25
                        }
                    ]
                }
            ]
        }
    ]

    it("should return the transformed order items", () => {

        const expected = [
            {
                name: "Chicken Parmesan",
                unitPrice: 16.00000,
                quantity: 1,
                addOns: ["Marinara", "Fries"]
            },
            {
                name: "Cheeseburger",
                unitPrice: 15.00000,
                quantity: 2,
                addOns: ["Cheddar", "Onion Rings"]
            }
        ]

        const result = transformOrderItems(apiItems)

        expect(result).toEqual(expected)
    })
})

describe("isWithInOverNightTimeRange", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("should return TRUE if isShipdayAllDayDeliveryEnabled is TRUE", () => {
        const isShipdayAllDayDeliveryEnabled = true
        const date = new Date();
        date.setHours(20, 0, 0);

        const result = isWithInOverNightTimeRange(isShipdayAllDayDeliveryEnabled, date)

        expect(result).toBe(true)
	})

    it("should return FALSE if current time is before the overnight (11PM to 7AM ET) time range", () => {
        const isShipdayAllDayDeliveryEnabled = false
        const date = new Date();
        date.setHours(2, 0, 0); // 9PM ET

        const result = isWithInOverNightTimeRange(isShipdayAllDayDeliveryEnabled, date)

        expect(result).toBe(false)
    })

    it("should return TRUE if current time is within the overnight (11PM to 7AM ET) time range", () => {
        const isShipdayAllDayDeliveryEnabled = false
        const date = new Date();
        date.setHours(5, 45, 0); // 12:45AM ET
        
        const result = isWithInOverNightTimeRange(isShipdayAllDayDeliveryEnabled, date)

        expect(result).toBe(true)
    })

    it("should return FALSE if current time is after the overnight (11PM to 7AM ET) time range", () => {
        const isShipdayAllDayDeliveryEnabled = false
        const date = new Date();
        date.setHours(14, 0, 0); // 9AM ET

        const result = isWithInOverNightTimeRange(isShipdayAllDayDeliveryEnabled, date)

        expect(result).toBe(false)
    })

})
