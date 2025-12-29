import React from 'react'
import { View, ScrollView, Pressable, Linking } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { PageContainer } from '@/src/components/ui/page-container'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const SectionHeading: React.FC<{ text: string }> = ({ text }) => (
	<Text variant='h4' className='text-blue-700 mb-4'>
		{text}
	</Text>
)

const BodyText: React.FC<{ text: string }> = ({ text }) => (
	<Text variant='p2Roman' className='text-gray-700 mb-6'>
		{text}
	</Text>
)

const FulFillMentPolicyScreen: React.FC = () => {
	return (
		<PageContainer>
			<ScrollView className='flex-1 bg-gray-300'>
				<View className='flex-row items-center p-4'>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center'
					>
						<Ionicons
							name='arrow-back-circle'
							size={24}
							className='text-blue-500'
						/>
						<Text variant='p2Heavy' className='text-blue-500 ml-2'>
							Back
						</Text>
					</Pressable>
				</View>
				<View className='px-6'>
					<Text variant='h1' className='text-blue-700 mb-6'>
						{`Fulfillment Policy`}
					</Text>

					<Text variant='p2Roman' className='text-gray-700 mb-9'>
						{`Last Updated: September 19, 2024`}
					</Text>

					<BodyText text='Welcome to Alfred! We are committed to providing you with a seamless and satisfying hotel room service ordering experience. This Fulfillment Policy outlines our procedures and guidelines to ensure your order is processed efficiently.' />

					<SectionHeading text='1. Order Confirmation' />
					<BodyText text='After your order is placed, you will receive a text confirmation once the restaurant has confirmed your order. There will be a link with your order details as well as an order tracker. Please review this information carefully to ensure accuracy.' />

					<SectionHeading text='2. Preparation and Dispatch' />
					<Text variant='p2Roman' className='text-gray-700 mb-3'>
						{`Preparation Time: Orders are typically prepared within 15-30 minutes from the time of confirmation, depending on the restaurant's kitchen capacity and order volume.`}
					</Text>
					<BodyText text='Dispatch Notification: You will receive a text notification when your order has been picked up by a delivery personnel.' />

					<SectionHeading text='3. Delivery Timeframe' />
					<Text variant='p2Roman' className='text-gray-700 mb-3'>
						{`Estimated Delivery: We aim to deliver your order within 30 min after dispatch. Factors such as traffic, weather, and distance may affect delivery times.`}
					</Text>
					<BodyText text='Real-time Tracking: You can track your delivery status through the link in your text notifications.' />

					<SectionHeading text='4. Order Modifications' />
					<BodyText text='Change Requests: If you need to modify or cancel your order, please contact our customer support team before it reaches the "Order Processed" stage. After this period, we may not be able to accommodate changes due to restaurant preparation schedules.' />

					<SectionHeading text='5. Order Accuracy' />
					<BodyText text='While we strive for accuracy, please make sure to double-check your order before finalizing it. If there is a discrepancy with your order upon delivery, please contact our customer support team immediately.' />

					<SectionHeading text='6. Delivery Issues' />
					<BodyText text='If you encounter any issues with your delivery (e.g., late delivery, missing items, or damaged food), please reach out to our customer support team within 24 hours of receiving your order. We will investigate and resolve the issue promptly.' />

					<SectionHeading text='7. Refunds and Returns' />
					<Text variant='p2Roman' className='text-gray-700 mb-3'>
						Refund Policy: If a refund is deemed appropriate it will be
						processed within 3-5 business days.
					</Text>
					<BodyText text='Return Policy: For food safety reasons, we do not accept returns of delivered food items.' />

					<SectionHeading text='8. Contact Us' />
					<Text variant='p2Roman' className='text-gray-700 mb-6'>
						{`For any questions or concerns regarding your order fulfillment, please contact our customer support team at `}
						<Pressable onPress={() => Linking.openURL('tel:+18447380342')}>
							<Text variant='p2Roman' className='text-blue-500'>
								+1 (844) 738-0342
							</Text>
						</Pressable>
					</Text>
					<BodyText text='Thank you for choosing Alfred! We appreciate your business and look forward to serving you.' />
				</View>
			</ScrollView>
		</PageContainer>
	)
}

export default FulFillMentPolicyScreen
