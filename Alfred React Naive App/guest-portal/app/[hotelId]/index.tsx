import { useEffect } from 'react'
import { useGlobalStore } from '@store/useGlobalStore'
import { router, useLocalSearchParams } from 'expo-router'

const HotelScreen = (): null => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const { showLoadingScreen, setCurrentHotelId } = useGlobalStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	useEffect(() => {
		if (!showLoadingScreen) {
			router.push(`/${hotelId}/order-food`)
		}
	}, [showLoadingScreen, hotelId])

	return null
}

export default HotelScreen
