import { View, Pressable } from 'react-native'
import { router } from 'expo-router'
import { RestaurantIcon } from '@components/ui/icons/RestaurantIcon'
import { CarIcon } from '@components/ui/icons/CarIcon'
import { Text } from '@components/ui/text'

type PromoCardsProperties = {
	hotelWebCode: string
}

const PromotionalCards = ({ hotelWebCode }: PromoCardsProperties) => {
	return (
		<View className='gap-[20]'>
			<View className='border-t border-white mt-[20]' />

			<View className='gap-[20] mb-8'>
				<Pressable>
					<View className='flex-row items-center bg-white rounded-lg'>
						<View className='bg-blue-500 items-center justify-center p-[22] rounded-l-lg'>
							<RestaurantIcon width='40' height='40' color='white' />
						</View>
						<Pressable
							onPress={() => {
								router.push(`/${hotelWebCode}/order-food`)
							}}
							className='flex-1'
						>
							<View className='p-[16]'>
								<Text variant='h2' className='text-blue-700'>
									{`In-Room Dining →`}
								</Text>
								<Text variant='p2Medium' className='text-gray-700'>
									{`24/7 dining options`}
								</Text>
							</View>
						</Pressable>
					</View>
				</Pressable>

				<Pressable>
					<View className='flex-row items-center bg-white rounded-lg'>
						<View className='bg-blue-500 items-center justify-center p-[22] rounded-l-lg'>
							<CarIcon width='40' height='40' color='white' />
						</View>
						<Pressable
							onPress={() => {
								router.push(`/${hotelWebCode}/airport-transfer`)
							}}
							className='flex-1'
						>
							<View className='p-[16]'>
								<Text variant='h2' className='text-blue-700'>
									{`Airport Transfers →`}
								</Text>
								<Text variant='p2Medium' className='text-gray-700'>
									{`Starting as low as $68`}
								</Text>
							</View>
						</Pressable>
					</View>
				</Pressable>
				<View className='border-t border-white' />
			</View>
		</View>
	)
}

export default PromotionalCards
