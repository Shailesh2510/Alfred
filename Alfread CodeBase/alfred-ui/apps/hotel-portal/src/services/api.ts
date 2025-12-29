import { Auth } from "aws-amplify"
import axios, { AxiosError } from "axios"
import { getCookie } from "@/shared-utils"
import Router from "next/router"
import { OrderCancelPayload } from "@/hooks/order/useCancelOrder"

export const axiosRequestInterceptor = async (config: any) => {
	const session = await Auth.currentSession()
	const token = session.getAccessToken().getJwtToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	if (typeof document !== "undefined") {
		const impersonatedHotel = getCookie("impersonatedHotel")
		if (impersonatedHotel) {
			config.params = {
				...config.params,
				tenant_mock_hotel_id: impersonatedHotel
			}
		}
	}

	return config
}

const axiosInstance = axios.create()

const rideAxiosInstance = axios.create()

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

const getOrderById = async ({ orderId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/order/${orderId}`
	)
	return data
}

const getOrders = async ({
	page,
	nonce,
	status,
	clientName,
	clientEmail,
	clientNumber,
	merchantId,
	voucherCode,
	mealPeriodId,
	orderType,
	toDate,
	fromDate
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/order`,
		{
			params: {
				page,
				nonce,
				status,
				clientName,
				clientEmail,
				clientNumber,
				merchantId,
				voucherCode,
				mealPeriodId,
				orderType,
				toDate,
				fromDate
			}
		}
	)
	return data
}

const getCurrentOrders = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/order/list/today`
	)
	return data
}

const getCommissions = async ({
	page,
	nonce,
	ambassador_name,
	toDate,
	fromDate
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/order/commissions`,
		{
			params: {
				page,
				nonce,
				ambassador_name,
				toDate,
				fromDate
			}
		}
	)
	return data
}

const getMealPeriods = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/meal_period`
	)
	return data
}

const getVoucherCodes = async ({
	page,
	voucherProgramId,
	voucherCode,
	voucherClaimed
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/voucher/code`,
		{
			params: {
				page,
				code: voucherCode,
				claimed: voucherClaimed,
				voucherProgramId: voucherProgramId
			}
		}
	)
	return data
}

const getVoucherPrograms = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/voucher/program`
	)
	return data
}

const generateVoucherCodes = async ({
	numberOfCodes,
	voucherProgramId
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/voucher/code/generate`,
		{
			numberOfCodes,
			voucherProgramId
		}
	)
	return data
}

const getMerchants = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/hotel/merchants`
	)
	return data
}

const getMenuDetailed = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/menu/detailed`
	)
	return data
}

const getMenuCategories = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/menu_category`
	)
	return data
}

const getCurrentHotel = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/hotel/me`
	)
	return data
}

const exportOrdersReport = async ({
	page,
	fromDate,
	toDate,
	status,
	merchantId,
	orderType,
	mealPeriodId,
	clientName,
	clientNumber,
	clientEmail,
	voucherCode
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/order/reports/export`,
		{
			params: {
				page,
				fromDate,
				toDate,
				status,
				merchantId,
				orderType,
				mealPeriodId,
				clientName,
				clientNumber,
				clientEmail,
				voucherCode
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

const cancelOrder = async (
	orderId: string,
	orderCancelPayload: OrderCancelPayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/cancel/order/${orderId}`,
		{
			...orderCancelPayload
		}
	)
	return data
}

const exportVouchersReport = async ({
	page,
	claimed,
	code,
	voucherProgramId
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/voucher/code/reports/export`,
		{
			params: { page, claimed, code, voucherProgramId },
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

const createOrder = async (orderData: any) => {
	try {
		const { data } = await rideAxiosInstance.post(
			`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/order`,
			{
				...orderData
			}
		)
		return data
	} catch (e) {
		window.sessionStorage.setItem(
			"error_message",
			JSON.stringify({
				title: "Order failed",
				message: "Order creation has failed"
			})
		)
		Router.push("/")
		return null
	}
}

const createReferralRecord = async (referralData: any) => {
	try {
		const response = await rideAxiosInstance.post(
			`https://api.getambassador.com/api/v2/${process.env.NEXT_PUBLIC_AMBASSADOR_API_USERNAME}/${process.env.NEXT_PUBLIC_AMBASSADOR_API_TOKEN}/json/event/record/`,
			referralData
		)
		return response
	} catch (e) {
		window.sessionStorage.setItem(
			"error_message",
			JSON.stringify({
				title: "Referral failed",
				message: "Referral creation has failed"
			})
		)
		return null
	}
}

const paymentInit = async (paymentData: any) => {
	try {
		const { data } = await rideAxiosInstance.post(
			`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/payment/init`,
			paymentData
		)
		return data
	} catch (e) {
		window.sessionStorage.setItem(
			"error_message",
			JSON.stringify({
				title: "Order payment",
				message: "Order payment has failed"
			})
		)
		Router.push("/")
		return null
	}
}

const getPriceList = async (webCode: string, priceList: any) => {
	const { data } = await rideAxiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/carmel/get-price-list/${webCode}`,
		priceList
	)
	return data
}

const createTrip = async (webCode: string, createTrip: any) => {
	const { data } = await rideAxiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/carmel/create-trip/${webCode}`,
		createTrip
	)
	return data
}

const getOrderByNonce = async ({ orderId }: any) => {
	const { data } = await rideAxiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/order/${orderId}`
	)
	return data
}

const getAmbassadorCode = async ({
	ambassadorCode,
	airportCode,
	webCode
}: any) => {
	const { data } = await rideAxiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/gateway/referral/public/${webCode}/${ambassadorCode}/${airportCode}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
			}
		}
	)
	return data
}

const getMerchantsAssociatedToHotels = async (webCode: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/merchants/hotel/${webCode}`
	)
	return data
}

const getMenu = async ({ hotelId }: any) => {
	const { data } = await rideAxiosInstance.get(
		`${process.env.NEXT_PUBLIC_S3_BASE_URL}/alfredmenu-bucket-${hotelId}-menu`
	)
	return data
}

const getVoucher = async ({ voucherCode, hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/voucher-code/${voucherCode}/hotel/${hotelId}`
	)
	return data
}

const refundVoucher = async (orderId: string) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/refund-voucher/order/${orderId}`
	)
	return data
}

const getShipdayDeliveryFees = async (hotelId: any, merchantId: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/shipday/get-delivery-fees/${hotelId}/${merchantId}`
	)
	return data
}

const getCanRelayDeliverToAddress = async (
	hotelWebCode: any,
	merchantId: any
) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/relay/quote?hotelWebCode=${hotelWebCode}&merchantId=${merchantId}`
	)

	return data["0"]["code"] === 201
}

// --- Password ---

const editPassword = async ({ userId, password, permanent }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotel/${userId}/credentials`,
		{
			password,
			permanent
		}
	)
	return data
}

const API = {
	getOrderById,
	getOrders,
	getCurrentOrders,
	getMealPeriods,
	getVoucherCodes,
	getVoucherPrograms,
	generateVoucherCodes,
	getMerchants,
	getMenuCategories,
	getMenuDetailed,
	getCurrentHotel,
	exportOrdersReport,
	exportVouchersReport,
	editPassword,
	createOrder,
	createReferralRecord,
	paymentInit,
	getPriceList,
	createTrip,
	getOrderByNonce,
	getAmbassadorCode,
	cancelOrder,
	getMerchantsAssociatedToHotels,
	getMenu,
	getVoucher,
	refundVoucher,
	getShipdayDeliveryFees,
	getCanRelayDeliverToAddress,
	getCommissions
}

export default API
