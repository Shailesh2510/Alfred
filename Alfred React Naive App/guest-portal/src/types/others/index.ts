export enum SnackbarType {
	SUCCESS = 'success',
	ERROR = 'error',
	INFO = 'info',
	WARNING = 'warning'
}

export interface Voucher {
	code: string
	total_amount: string
	type: string
	id: number
	amount_type: string
}
