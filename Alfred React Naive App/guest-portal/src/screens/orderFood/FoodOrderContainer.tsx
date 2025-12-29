import React, { memo, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useCartStore } from '@/src/store/useCartStore'
import { HotelHeader } from '@/src/components/layout/HotelHeader'
import ServiceTabs from '@/src/components/layout/ServiceTabs'
import { PageContainer } from '@/src/components/ui/page-container'
import LoadingScreen from '@/src/components/ui/loading-screen'
import { Merchant } from '@/src/types/merchant-types/merchants'
import SchedulerClockContainer from './components/SchedulerClockContainer'
import MerchantCard from '@/src/components/layout/MerchantCard'
import SchedulerModal from '../../components/modals/SchedulerModal'
import { formatInTimeZone } from 'date-fns-tz'
import useFetchMenuDetails from '@/src/hooks/useFetchMenuDetails'
import { addMinutes } from 'date-fns'
import useDeliveryFee from '@/src/hooks/useDeliveryFee'
import useCanRelayDeliverToAddress from '@/src/hooks/useCanRelayDeliverToAddress'
import { DEFAULT_RELAY_DELIVERY_FEE } from '@/src/utils/constants'
import { isWithInOverNightTimeRange } from '@/src/utils/time-utils/isWithInOverNightTimeRange'
import NoMenuModal from '@/src/components/modals/NoMenuModal'

type FoodOrderContainerProperties = {
	scrollableReference?: React.RefObject<ScrollView>
}

export const extractMealPeriodId = (data: any) => {
	for (const key in data) {
		if (data[key] && data[key].length > 0) {
			return data[key][0].meal_period_id
		}
		break
	}
	return null
}

const FoodOrderContainer = ({
	scrollableReference
}: FoodOrderContainerProperties): JSX.Element => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const [showNoMenuModal, setShowNoMenuModal] = useState(false)
	const {
		currentHotelDetails,
		merchantDetails,
		setCurrentHotelId,
		showLoadingScreen,
		isUserScrolling,
		setSelectedMerchantId,
		selectedMerchantId,
		setSelectedMerchantCoordinates,
		setSchedulerModalVisible
	} = useGlobalStore()
	const {
		order,
		setMenuItems,
		resetOrder,
		setOrderScheduledDate,
		setDeliveyFee,
		setCurrentMealPeriodId
	} = useCartStore()
	const timezone = currentHotelDetails?.timezone || 'America/New_York'

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [hotelId])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	const { mutate: fetchMenuDetails, isPending } = useFetchMenuDetails({
		onSuccess: (result: any) => {
			if (!result || Object.keys(result).length === 0) {
				setShowNoMenuModal(true)
				return
			}
			setMenuItems(result)
			setCurrentMealPeriodId(extractMealPeriodId(result))
			router.push(`/${hotelId}/order-food/${selectedMerchantId}`)
		},
		onError: () => {
			setShowNoMenuModal(true)
		}
	})

	const {
		mutate: checkForRelayDelivery,
		isPending: canRelayDeliverToAddressLoading
	} = useCanRelayDeliverToAddress({
		onSuccess: (data: any) => {
			if (data.code === 201) {
				setDeliveyFee(DEFAULT_RELAY_DELIVERY_FEE)
			} else {
				fetchShipdayDeliveryFee({
					hotelId: hotelId,
					merchantId: +selectedMerchantId
				})
			}
		}
	})

	const {
		mutate: fetchShipdayDeliveryFee,
		isPending: fetchingShipDayDeliveryFee
	} = useDeliveryFee({
		onSuccess: (data: any) => {
			setDeliveyFee(data.fee)
		}
	})

	const handleFetchDeliveyFees = (merchantId: number) => {
		const isOutsideTimeRange = isWithInOverNightTimeRange()
		if (isOutsideTimeRange) {
			fetchShipdayDeliveryFee({
				hotelId: hotelId,
				merchantId: merchantId
			})
		} else {
			checkForRelayDelivery({
				hotelWebCode: hotelId,
				merchantId: merchantId
			})
		}
	}

	const handleSetFetchMenuPayload = (merchantId: string) => {
		const selectedTime = order.scheduledDate
		if (selectedTime) {
			const now = new Date()
			const currentTime = formatInTimeZone(now, timezone, 'HH:mm')
			if (selectedTime === 'ASAP') {
				const payload = {
					scheduledDate: formatInTimeZone(
						now,
						'UTC',
						`yyyy-MM-dd'T'HH:mm:ss.SSSX`
					),
					scheduledStartTime: currentTime,
					scheduledEndTime: currentTime
				}
				fetchMenuDetails({
					hotelId: currentHotelDetails?.id.toString() ?? '',
					merchantId: merchantId,
					fetchMenuPayload: payload
				})
				setOrderScheduledDate('ASAP')
			} else {
				const scheduledDate = formatInTimeZone(
					selectedTime,
					'UTC',
					`yyyy-MM-dd'T'HH:mm:ss.SSSX`
				)
				const startTime = formatInTimeZone(selectedTime, timezone, 'HH:mm')

				const endTime = formatInTimeZone(
					addMinutes(new Date(selectedTime), 30),
					timezone,
					'HH:mm'
				)
				const payload = {
					scheduledDate,
					scheduledStartTime: startTime,
					scheduledEndTime: endTime
				}
				fetchMenuDetails({
					hotelId: currentHotelDetails?.id.toString() ?? '',
					merchantId: merchantId,
					fetchMenuPayload: payload
				})
			}
			setOrderScheduledDate(selectedTime)
		}
	}

	if (
		isPending ||
		fetchingShipDayDeliveryFee ||
		canRelayDeliverToAddressLoading
	) {
		return (
			<View className='flex-1 justify-center items-center h-full'>
				<ActivityIndicator animating={true} color={'#022867'} size={'large'} />
			</View>
		)
	}

	return (
		<PageContainer>
			{showNoMenuModal ? (
				<NoMenuModal
					visible={showNoMenuModal}
					onClose={() => {
						setShowNoMenuModal(false)
					}}
				/>
			) : null}
			<HotelHeader
				hotelName={currentHotelDetails?.name || ''}
				hotelId={hotelId as string}
			/>
			<ServiceTabs hotelId={hotelId as string} />
			<SchedulerClockContainer
				scrollableRef={scrollableReference}
				timeSlot={
					order.scheduledDate === 'ASAP'
						? 'ASAP'
						: formatInTimeZone(
								order.scheduledDate,
								currentHotelDetails?.timezone ?? 'America/New_York',
								'M/d/yy - h:mm a'
							)
				}
				onPress={() => setSchedulerModalVisible(true)}
				isUserScrolling={isUserScrolling}
			/>

			<ScrollView className='flex-1 bg-gray-300'>
				{merchantDetails
					?.filter((m: Merchant) => m.merchant_type !== 'RIDES')
					?.map((merchant: Merchant) => (
						<MerchantCard
							key={merchant.id}
							merchant={merchant}
							onPress={() => {
								resetOrder()
								setSelectedMerchantId(merchant.id.toString())
								setSelectedMerchantCoordinates(merchant.coordinates)
								handleSetFetchMenuPayload(merchant.id.toString())
								handleFetchDeliveyFees(merchant.id)
							}}
						/>
					))}
			</ScrollView>
		</PageContainer>
	)
}

export default memo(FoodOrderContainer)
