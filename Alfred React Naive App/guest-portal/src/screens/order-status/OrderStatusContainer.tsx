import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import LoadingScreen from '@/src/components/ui/loading-screen'
import useOrder from '@/src/hooks/useOrder'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import {
	MERCHANT_TYPE_RIDES,
	ORDER_CHANNEL,
	ORDER_STATUS_UPDATED_EVENT
} from '@/src/utils/constants'
import { useLocalSearchParams } from 'expo-router'
import Pusher from 'pusher-js'
import RideOrderStatus from './components/RideOrderStatus'
import FoodOrderStatus from './components/FoodOrderStatus'

const OrderStatusContainer = () => {
	const { orderId } = useLocalSearchParams<{ orderId: string }>()
	const { showLoadingScreen, setCurrentHotelDetails } = useGlobalStore()

	const {
		data: order,
		refetch: refetchOrder,
		isLoading: orderLoading
	} = useOrder(orderId, {
		enabled: false,
		refetchOnWindowFocus: false
	})

	const [currentOrder, setCurrentOrder] = useState<any>()

	useEffect(() => {
		if (!orderLoading && order) {
			setCurrentOrder(order?.data?.[0])
			setCurrentHotelDetails(order?.data?.[0].hotelWebCode)
		}
	}, [order])

	useEffect(() => {
		if (orderId) {
			refetchOrder()
		}
	}, [orderId])

	useEffect(() => {
		const pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(ORDER_CHANNEL)
		channel.bind(ORDER_STATUS_UPDATED_EVENT, (order: any) => {
			if (order.nonce === orderId) {
				refetchOrder()
			}
		})

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [orderId])

	if (!currentOrder) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<View>
			{currentOrder.merchantType === MERCHANT_TYPE_RIDES ? (
				<RideOrderStatus currentOrder={currentOrder} />
			) : (
				<FoodOrderStatus currentOrder={currentOrder} />
			)}
		</View>
	)
}

export default OrderStatusContainer
