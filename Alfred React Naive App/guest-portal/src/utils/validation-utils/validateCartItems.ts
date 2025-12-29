export const validateCartItems = (cartItems: any[], menuItems: any) => {
	const validItemIds = new Set(
		Object.values(menuItems)
			.flat()
			.map((item: any) => item.item_id)
	)

	return cartItems.map(cartItem => ({
		...cartItem,
		itemExists: validItemIds.has(cartItem.id)
	}))
}
