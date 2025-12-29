import { View, ScrollView } from 'react-native'
import { ConfirmIcon } from '@components/ui/icons/ConfirmIcon'
import { CancelIcon } from '@components/ui/icons/CancelIcon'
import { Text } from '@components/ui/text'
import { ORDER_STATUS } from '@/src/utils/constants'
import { formatInTimeZone } from 'date-fns-tz'
import PromotionalCards from '@components/layout/PromotionalCards'

const RideOrderStatus = (value: any) => {
	const { currentOrder } = value
	const orderCanceled = currentOrder?.status === ORDER_STATUS.CANCELED.value
	const orderConfirmed =
		currentOrder?.status !== ORDER_STATUS.CANCELED.value &&
		currentOrder?.status !== ORDER_STATUS.INITIATED.value

	return (
		<View className='bg-gray-300 flex-1 h-full'>
			{orderConfirmed && (
				<View className='bg-blue-600 items-center'>
					<Text variant='p2Heavy' className='text-gray-100 py-[10]'>
						{`Scheduled for ${formatInTimeZone(
							currentOrder?.scheduledDate,
							currentOrder?.timezone,
							"MMMM do, yyyy 'at' h:mm a"
						)}`}
					</Text>
				</View>
			)}
			<ScrollView className='bg-gray-300'>
				<View className='mx-[23.5]'>
					<View className='flex items-center'>
						<View className='py-[20]'>
							<View
								className={`rounded-full flex items-center p-4 ${
									orderConfirmed ? 'bg-utility-green50' : ''
								} ${orderCanceled ? 'bg-utility-red50' : ''}`}
							>
								{orderConfirmed && <ConfirmIcon />}
								{orderCanceled && <CancelIcon />}
							</View>
						</View>

						<View className='items-center gap-[20]'>
							<Text variant='h2' className='text-blue-700'>
								{orderConfirmed
									? 'Your ride is booked!'
									: 'Your ride has been cancelled'}
							</Text>

							{orderConfirmed && (
								<Text variant='p2Medium' className='text-gray-700'>
									{`Track your ride's progress via SMS and email updates.`}
								</Text>
							)}
						</View>
					</View>

					<PromotionalCards hotelWebCode={currentOrder?.hotelWebCode} />
				</View>
			</ScrollView>
		</View>
	)
}

export default RideOrderStatus
