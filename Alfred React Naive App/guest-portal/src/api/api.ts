/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios from 'axios'
import { getHotels, getMerchantsAssociatedToHotels } from './hotelApi'
import { getMenu, getMenuDetails } from './menuApi'
import { cancelOrder, createOrder, getOrder } from './orderApi'
import { createGuest } from './conciergeApi'
import {
	getShipdayDeliveryFees,
	getCanRelayDeliverToAddress
} from './deliveryApi'
import { paymentInit } from './paymentApi'
import { createReferralRecord, getAmbassadorCode } from './referralApi'
import { getPriceList, createTrip } from './rideApi'
import { getVoucher, getReservationVoucher, refundVoucher } from './voucherApi'

export const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(
	config => {
		const token = process.env.EXPO_PUBLIC_API_KEY
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

const API = {
	getHotels,
	getMenu,
	getMenuDetails,
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
	createTrip,
	cancelOrder,
	getAmbassadorCode,
	createGuest
}

export default API
