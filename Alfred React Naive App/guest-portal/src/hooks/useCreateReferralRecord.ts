import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

export type CreateReferralPayload = {
	amount: number
	orderId: string
	clientName: string
	clientEmail: string
	campaignUid: string
	shortCode: string
}

const useCreateReferralRecord = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			amount,
			orderId,
			clientName,
			clientEmail,
			campaignUid,
			shortCode
		}: CreateReferralPayload) =>
			API.createReferralRecord({
				revenue: amount,
				transaction_uid: orderId,
				first_name: clientName,
				email: clientEmail,
				campaign_uid: campaignUid,
				short_code: shortCode
			}),
		...queryConfig
	})
}

export default useCreateReferralRecord
