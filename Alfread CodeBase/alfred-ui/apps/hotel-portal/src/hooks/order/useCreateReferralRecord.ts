import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useCreateReferralRecord = (queryConfig = {}) => {
	return useMutation(
		({
			amount,
			orderId,
			clientName,
			clientEmail,
			campaignUid,
			shortCode
		}: any) =>
			API.createReferralRecord({
				revenue: amount,
				transaction_uid: orderId,
				first_name: clientName,
				email: clientEmail,
				campaign_uid: campaignUid,
				short_code: shortCode
			}),
		{
			...queryConfig
		}
	)
}

export default useCreateReferralRecord
