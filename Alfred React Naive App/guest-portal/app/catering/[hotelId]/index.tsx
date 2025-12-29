import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'

const CateringHotel = () => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === 'development'
				? 'https://catering-dev.getalfred.com/catering'
				: 'https://catering.getalfred.com/catering'
		globalThis.location.replace(`${baseUrl}/${hotelId}`)
	}, [])

	return null
}

export default CateringHotel
