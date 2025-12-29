import React, { memo, useEffect } from 'react'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useLocalSearchParams } from 'expo-router'
import { HotelHeader } from '@/src/components/layout/HotelHeader'
import ServiceTabs from '@/src/components/layout/ServiceTabs'
import { PageContainer } from '@/src/components/ui/page-container'
import LoadingScreen from '@/src/components/ui/loading-screen'
import ConciergeFormContainer from './components/ConciergeFormContainer'
import { ScrollView } from 'react-native'

const ConciergeServiceContainer = (): JSX.Element => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()

	const { currentHotelDetails, setCurrentHotelId, showLoadingScreen } =
		useGlobalStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [hotelId, setCurrentHotelId])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<PageContainer>
			<HotelHeader
				hotelName={currentHotelDetails?.name || ''}
				hotelId={hotelId as string}
			/>
			<ServiceTabs hotelId={hotelId as string} />
			<ScrollView className='flex-1 bg-gray-300'>
				<ConciergeFormContainer />
			</ScrollView>
		</PageContainer>
	)
}

export default memo(ConciergeServiceContainer)
