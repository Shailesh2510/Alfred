import { Auth } from "aws-amplify"
import axios, { AxiosError } from "axios"
import { getCookie } from "@/shared-utils"

export const axiosRequestInterceptor = async (config: any) => {
	const session = await Auth.currentSession()
	const token = session.getAccessToken().getJwtToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	if (typeof document !== "undefined") {
		const impersonatedMerchant = getCookie("impersonatedMerchant")
		if (impersonatedMerchant) {
			config.params = {
				...config.params,
				tenant_mock_merchant_id: impersonatedMerchant
			}
		}
	}

	return config
}

const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(axiosRequestInterceptor, e =>
	Promise.reject(e)
)
axiosInstance.interceptors.response.use(
	response => {
		return response
	},
	async (error: AxiosError) => {
		if (error.response?.status === 403) {
			try {
				await Auth.signOut()
				window.location.reload()
			} catch (signOutError) {
				console.error("Error signing out:", signOutError)
			}
		}

		return Promise.reject(error)
	}
)

const getOrders = async ({
	page,
	status,
	fromDate,
	toDate,
	hotelId,
	roomNumber
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order`,
		{
			params: {
				page,
				status,
				fromDate,
				toDate,
				hotelId,
				roomNumber
			}
		}
	)
	return data
}

const getOrder = async ({ orderId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}`
	)
	return data
}

const getCurrentOrders = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/list/today`
	)
	return data
}

const changeStatusToCanceled = async ({
	orderId,
	version,
	cancelReason,
	cancelOption
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/cancel`,
		{
			version,
			reason: cancelReason,
			option: cancelOption
		}
	)
	return data
}

const changeStatusToPending = async ({ orderId, version }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/pending`,
		{
			version
		}
	)
	return data
}

const changeStatusToConfirmed = async ({ orderId, version }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/confirm`,
		{
			version
		}
	)
	return data
}

const changeStatusToInPreparation = async ({ orderId, version }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/preparation`,
		{
			version
		}
	)
	return data
}

const changeStatusToInDelivery = async ({ orderId, version }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/in_delivery`,
		{
			version
		}
	)
	return data
}

const changeStatusToDeliverd = async ({ orderId, version }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/${orderId}/delivered`,
		{
			version
		}
	)
	return data
}

const getHotels = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/merchant/hotels`
	)
	return data
}

const getCategorizedProducts = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/item/list/categorized`
	)
	return data
}

const getMealPeriods = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/meal_period`
	)
	return data
}

const getCurrentMerchant = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/merchant/me`
	)
	return data
}

const exportOrdersReport = async ({
	page,
	fromDate,
	toDate,
	status,
	hotelId
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/order/reports/export`,
		{
			params: {
				page,
				fromDate,
				toDate,
				status,
				hotelId
			},
			responseType: "arraybuffer",
			headers: {
				"Content-Disposition": "attachment; filename=template.xlsx",
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			}
		}
	)
	return data
}

// --- Stock ---

const updateProductStock = async ({ merchantId, itemId, out }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/out_of_stock/merchant/${merchantId}`,
		{
			itemId,
			out
		}
	)
	return data
}

// --- Password ---

const editPassword = async ({ userId, password, permanent }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant/${userId}/credentials`,
		{
			password,
			permanent
		}
	)
	return data
}

const API = {
	getOrder,
	getOrders,
	getCurrentOrders,
	changeStatusToCanceled,
	changeStatusToConfirmed,
	changeStatusToDeliverd,
	changeStatusToInDelivery,
	changeStatusToInPreparation,
	getHotels,
	getCategorizedProducts,
	getMealPeriods,
	getCurrentMerchant,
	exportOrdersReport,
	updateProductStock,
	editPassword,
	changeStatusToPending
}

export default API
