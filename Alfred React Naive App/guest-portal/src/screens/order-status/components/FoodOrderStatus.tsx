import { View, ScrollView } from 'react-native'
import { ConfirmIcon } from '@components/ui/icons/ConfirmIcon'
import { CancelIcon } from '@components/ui/icons/CancelIcon'
import { Text } from '@components/ui/text'
import { ORDER_STATUS } from '@/src/utils/constants'
import { format } from 'date-fns'
import { parseISO } from 'date-fns'
import PromotionalCards from '@components/layout/PromotionalCards'

const getActiveStep = (status: string) => {
	switch (status) {
		case ORDER_STATUS.PENDING.value: {
			return 0
		}
		case ORDER_STATUS.CONFIRMED.value: {
			return 1
		}
		case ORDER_STATUS.PREPARATION.value: {
			return 2
		}
		case ORDER_STATUS.IN_DELIVERY.value: {
			return 3
		}
		case ORDER_STATUS.DELIVERED.value: {
			return 4
		}
		case ORDER_STATUS.CANCELED.value: {
			return 5
		}
		default: {
			return 0
		}
	}
}

const OrderTrackerStep = ({
	completed,
	isLast,
	label,
	description
}: {
	completed: boolean
	isLast: boolean
	label: string
	description?: string
}) => (
	<View className='flex-row'>
		<View className='items-center'>
			<View
				className={`w-[24] h-[24] rounded-full items-center justify-center ${completed ? 'bg-utility-green50' : 'bg-gray-250'}`}
			>
				{completed && <ConfirmIcon width='14' height='14' color='#0A6555' />}
			</View>
			{!isLast && (
				<View
					className={`w-2 h-16 ${completed ? 'bg-utility-green50' : 'bg-gray-250'}`}
				/>
			)}
		</View>
		<View className='ml-[20] pb-[20]'>
			<Text
				variant='h5'
				className={`${completed ? 'text-blue-700' : 'text-blue-700'}`}
			>
				{label}
			</Text>
			{description && (
				<Text variant='p2Roman' className='text-gray-700 mt-[6]'>
					{description}
				</Text>
			)}
		</View>
	</View>
)

const FoodOrderStatus = (value: any) => {
	const { currentOrder } = value
	const orderCanceled = currentOrder?.status === ORDER_STATUS.CANCELED.value
	const orderConfirmed =
		currentOrder?.status !== ORDER_STATUS.CANCELED.value &&
		currentOrder?.status !== ORDER_STATUS.INITIATED.value
	const activeStep = getActiveStep(currentOrder?.status)

	return (
		<View className='bg-gray-300 flex-1 h-full'>
			{orderConfirmed && currentOrder?.scheduledDate && (
				<View className='bg-blue-600 items-center'>
					<Text variant='p2Heavy' className='text-gray-100 py-[10]'>
						{`Scheduled for ${format(parseISO(currentOrder?.scheduledDate), "MMMM do, yyyy 'at' h:mm a")}`}
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
									? 'Thank you for your order!'
									: 'Your order has been cancelled'}
							</Text>
							{orderConfirmed && (
								<Text variant='p2Roman' className='text-gray-700 text-center'>
									{`Your confirmation number is ${currentOrder?.nonce}. You'll receive SMS updates as your order progresses.`}
								</Text>
							)}
						</View>
					</View>

					<PromotionalCards hotelWebCode={currentOrder?.hotelWebCode} />

					{!orderCanceled && (
						<View className='mx-[50]'>
							{[
								{
									label: 'Order placed',
									description: 'We have received your order'
								},
								{
									label: 'Order confirmed',
									description: 'Your order has been confirmed'
								},
								{
									label: 'Order processed',
									description: 'We are preparing your order'
								},
								{
									label: 'In delivery',
									description: 'Your order is on its way'
								},
								{
									label: 'Delivered',
									description: 'Enjoy your food!'
								}
							].map((step, index) => (
								<OrderTrackerStep
									key={step.label}
									completed={activeStep >= index}
									isLast={index === 4}
									label={step.label}
									description={step.description}
								/>
							))}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	)
}

export default FoodOrderStatus
