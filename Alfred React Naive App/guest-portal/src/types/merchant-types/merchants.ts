export interface Coordinates {
	x: number
	y: number
}

export interface Merchant {
	id: number
	version: number
	name: string
	coordinates: Coordinates
	city_id: number
	tax_rate: string
	contact_email: string
	contact_phone: string
	address_number: string
	address_street: string
	address_town: string
	address_zip_code: string
	is_active: boolean
	created_at: string
	updated_at: string
	deleted_at: string | null
	has_third_party_delivery: boolean
	cover_image_url: string
	image_url: string
	allow_catering: boolean
	color: string
	description: string
	merchant_type: string
	city_name: string
	order_position: number
	eta: number
	meal_period_ids: number[]
}
