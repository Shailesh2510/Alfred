export const formatPrice = (price: string) =>
	`$${Number.parseFloat(price).toFixed(2)}`
