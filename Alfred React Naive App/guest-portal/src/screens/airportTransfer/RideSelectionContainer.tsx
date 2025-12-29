import { View, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '@components/ui/text'
import LoadingScreen from '@/src/components/ui/loading-screen'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useLocalSearchParams, router } from 'expo-router'
import CarmelCarCard from './components/CarmelCarCard'
import StickyCheckoutSection from './components/StickyCheckoutSection'
import { useRideStore } from '@/src/store/useRideStore'
import { formatInTimeZone } from 'date-fns-tz'
import { formatTime } from '@/src/utils/time-utils/formatTimeInClockFormat'
import { DEFAULT_TIMEZONE } from '@/src/utils/constants'

const RideSelectionContainer = (): JSX.Element => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const [selectedRideId, setSelectedRideId] = useState<string | null>(null)

	const handleSelectRide = (rideId: string) => {
		setSelectedRideId(rideId)
	}
	const {
		setCurrentHotelId,
		showLoadingScreen,
		carmelMerchantId,
		currentHotelDetails
	} = useGlobalStore()

	const {
		rideOptions,
		rideForm,
		rideScheduledDate,
		timeValue,
		selectedRide,
		setRideOptions
	} = useRideStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<View style={{ flex: 1 }}>
			<View className='bg-blue-600 py-[10]'>
				<View className='flex-row items-center justify-center gap-[12]'>
					{rideScheduledDate ? (
						<>
							<Text className='text-white text-center' variant='p2Medium'>
								{`${formatInTimeZone(new Date(rideScheduledDate), currentHotelDetails?.timezone || DEFAULT_TIMEZONE, "MMMM do, yyyy 'at' h:mm a")} to ${rideForm.airport}`}
							</Text>
							<Pressable
								onPress={() => {
									router.back()
									setRideOptions([])
								}}
							>
								<Text
									className='text-white border-b border-white'
									variant='p2Medium'
								>
									{`edit`}
								</Text>
							</Pressable>
						</>
					) : null}
				</View>
			</View>
			<ScrollView className='flex-1 h-full bg-gray-300'>
				<View className='mb-[16]'>
					{rideOptions.map(option => (
						<CarmelCarCard
							key={option.carClassID}
							rideOption={option}
							isSelected={selectedRideId === option.fare.fareId}
							onSelectRide={handleSelectRide}
						/>
					))}
				</View>
			</ScrollView>
			<StickyCheckoutSection
				selectedRide={selectedRide}
				timeLeft={formatTime(timeValue)}
				onProceed={() =>
					router.push(
						`/${hotelId}/airport-transfer/${carmelMerchantId}/checkout`
					)
				}
			/>
		</View>
	)
}

export default RideSelectionContainer
