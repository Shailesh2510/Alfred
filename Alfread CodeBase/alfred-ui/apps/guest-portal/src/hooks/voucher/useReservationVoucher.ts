import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useReservationVoucher = (queryConfig = {}) => {
	return useMutation(
		({ webCode, lastName, roomNumber }: any) =>
			API.getReservationVoucher({ webCode, lastName, roomNumber }),
		{
			...queryConfig
		}
	)
}

export default useReservationVoucher
