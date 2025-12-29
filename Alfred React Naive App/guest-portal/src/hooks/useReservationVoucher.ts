import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

type ReservationVoucherPayload = {
	webCode: string
	lastName: string
	roomNumber: string
}

const useReservationVoucher = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			webCode,
			lastName,
			roomNumber
		}: ReservationVoucherPayload) =>
			API.getReservationVoucher(webCode, lastName, roomNumber),
		...queryConfig
	})
}

export default useReservationVoucher
