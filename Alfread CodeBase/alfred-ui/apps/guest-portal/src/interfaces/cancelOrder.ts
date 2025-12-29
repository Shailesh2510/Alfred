export interface CancelOrderDTO {
	orderId: string
	orderCancelPayload: OrderCancelPayload
}

export interface OrderCancelPayload {
	reason: string
	option: string
}
