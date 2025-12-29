import { View, ScrollView } from 'react-native'
import { Text } from '@components/ui/text'
import { ConfirmIcon } from '@components/ui/icons/ConfirmIcon'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import PromotionalCards from '@components/layout/PromotionalCards'

const ConciergeConfirmation = () => {
	const { currentHotelDetails } = useGlobalStore()
	const hotelWebCode = currentHotelDetails?.webCode || ''

	return (
		<View className='bg-gray-300 flex-1 h-full'>
			<ScrollView className='bg-gray-300'>
				<View className='mx-[23.5]'>
					<View className='flex items-center'>
						<View className='py-[20]'>
							<View className='rounded-full flex items-center p-4 bg-utility-green50'>
								<ConfirmIcon />
							</View>
						</View>

						<View className='items-center gap-[20]'>
							<Text variant='h2' className='text-blue-700 text-center'>
								{`Thanks! An agent will be in touch with you shortly!`}
							</Text>
							<Text variant='p2Roman' className='text-gray-700 text-center'>
								{`Our concierge team is available 24/7 to assist with your needs.`}
							</Text>
						</View>
					</View>

					<PromotionalCards hotelWebCode={hotelWebCode} />
				</View>
			</ScrollView>
		</View>
	)
}

export default ConciergeConfirmation
