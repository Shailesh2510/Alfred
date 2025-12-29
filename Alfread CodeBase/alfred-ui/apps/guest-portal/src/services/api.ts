import { OrderCancelPayload } from "@/interfaces/cancelOrder"
import { IHotel } from "@/interfaces/hotel"
import axios from "axios"
import Router from "next/router"

const axiosInstance = axios.create()

const getHotels = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_S3_BASE_URL}/hotels`
	)
	return data as IHotel[]
}

const getMerchantsAssociatedToHotels = async (webCode: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/merchants/hotel/${webCode}`
	)
	return data
}

const getMenu = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_S3_BASE_URL}/alfredmenu-bucket-${hotelId}-menu`
	)
	return data
}

const getOrder = async ({ orderId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/order/${orderId}`
	)
	return data
}

const getVoucher = async ({ voucherCode, hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/voucher-code/${voucherCode}/hotel/${hotelId}`
	)
	return data
}

const getCarmelMealPeiordId = async (merchantId: number) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/mealperiods/merchant/${merchantId}`
	)
	return data
}

const getReservationVoucher = async ({
	webCode,
	lastName,
	roomNumber
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/guest/${webCode}/${lastName}/${roomNumber}`
	)
	return data
}

const createOrder = async (orderData: any) => {
	try {
		const { data } = await axiosInstance.post(
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

const cancelOrder = async (
	orderId: string,
	orderCancelPayload: OrderCancelPayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/cancel/order/${orderId}`,
		{
			...orderCancelPayload
		}
	)
	return data
}

const paymentInit = async (paymentData: any) => {
	try {
		const { data } = await axiosInstance.post(
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

const refundVoucher = async (orderId: string) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/refund-voucher/order/${orderId}`
	)
	return data
}

const getPriceList = async (webCode: string, priceList: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/carmel/get-price-list/${webCode}`,
		priceList
	)
	return data
}

const createTrip = async (webCode: string, createTrip: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/carmel/create-trip/${webCode}`,
		createTrip
	)
	return data
}

const getShipdayDeliveryFees = async (hotelId: any, merchantId: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/shipday/get-delivery-fees/${hotelId}/${merchantId}`
	)
	return data
}

const createReferralRecord = async (referralData: any) => {
	try {
		const response = await axiosInstance.post(
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

const getCanRelayDeliverToAddress = async (
	hotelWebCode: any,
	merchantId: any
) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_OPEN_BASE_URL}/relay/quote?hotelWebCode=${hotelWebCode}&merchantId=${merchantId}`
	)

	return data["0"]["code"] === 201
}

const getAmbassadorCode = async ({
	ambassadorCode,
	airportCode,
	webCode
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/gateway/referral/public/${webCode}/${ambassadorCode}/${airportCode}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
			}
		}
	)
	return data
}

const API = {
	getHotels,
	getMenu,
	getOrder,
	getVoucher,
	createOrder,
	paymentInit,
	getReservationVoucher,
	refundVoucher,
	getMerchantsAssociatedToHotels,
	createReferralRecord,
	getShipdayDeliveryFees,
	getCanRelayDeliverToAddress,
	getPriceList,
	getCarmelMealPeiordId,
	createTrip,
	cancelOrder,
	getAmbassadorCode
}

export default API
