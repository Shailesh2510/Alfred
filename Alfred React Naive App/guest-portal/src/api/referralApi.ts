import { CreateReferralAPIPayload } from '../types/order-types/createReferral'
import { axiosInstance } from './api'

export const createReferralRecord = async (
	referralData: CreateReferralAPIPayload
) => {
	const response = await axiosInstance.post(
		`https://api.getambassador.com/api/v2/${process.env.EXPO_PUBLIC_AMBASSADOR_API_USERNAME}/${process.env.EXPO_PUBLIC_AMBASSADOR_API_TOKEN}/json/event/record/`,
		referralData
	)
	return response
}

export const getAmbassadorCode = async ({
	ambassadorCode,
	airportCode,
	webCode
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/referral/public/${webCode}/${ambassadorCode}/${airportCode}`
	)
	return data
}
