export const calculateTotalModifierPrice = (
	productModifierOptions: any[] = []
) => {
	return productModifierOptions.reduce((total: number, option: any) => {
		return total + (option?.price || 0)
	}, 0)
}

export const calculateItemSubtotal = ({
	productPrice: productPrice = 0,
	productQuantity: productQuantity = 0,
	productModifierOptions = []
}: {
	productPrice: number
	productQuantity: number
	productModifierOptions: any[]
}) => {
	if (productPrice < 0 || productQuantity < 0) {
		throw new Error("Product price and quantity must be non-negative")
	}
	const basePrice = productPrice
	const modifiersTotal = calculateTotalModifierPrice(productModifierOptions)
	const pricePerItem = basePrice + modifiersTotal
	return pricePerItem * productQuantity
}

export const calculateModifierPrice = (
	optionPrice: number = 0,
	quantity: number = 0
) => {
	return optionPrice * quantity
}
