export interface ModifierOption {
	id: number
	name: string
	price: number
}

export interface Modifier {
	id: number
	version: number
	merchant_id: number
	name: string
	required_options: boolean
	multiple_options: boolean
	created_at: string
	updated_at: string
	deleted_at: string | null
	free_modifier_count: number
	item_id: number
	options: ModifierOption[]
}

export interface MenuItem {
	menu_item_id: number
	menu_id: number
	menu_category_id: number
	menu_category_name: string
	menu_category_position: number
	meal_period_id: number
	meal_period_name: string
	merchant_id: number
	meal_period_start_hour: string
	meal_period_end_hour: string
	item_id: number
	item_name: string
	image_url: string
	description: string
	item_order_quantity: number
	price: string
	new_price: string
	order_position: number
	tags: string
	out_of_stock_id: number | null
	modifiers: Modifier[]
	merchant_name: string
	tax_rate: string
	merchant_is_active: boolean
}

export interface FetchMenuPayload {
	scheduledDate: string
	scheduledStartTime: string
	scheduledEndTime: string
}
