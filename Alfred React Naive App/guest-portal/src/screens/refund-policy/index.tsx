import React from 'react'
import { View, ScrollView, Pressable, Linking } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { PageContainer } from '@/src/components/ui/page-container'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const Section: React.FC<{ title: string }> = ({ title }) => (
	<Text variant='h4' className='text-blue-700 mb-4'>
		{title}
	</Text>
)

const Paragraph: React.FC<{ text: string }> = ({ text }) => (
	<Text variant='p2Roman' className='text-gray-700 mb-6'>
		{text}
	</Text>
)

const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
	<View className={'flex-row mb-3'}>
		<Text variant='p2Roman' className='text-gray-700 w-4'>
			•
		</Text>

		<Text variant='p2Roman' className='text-gray-700 flex-1'>
			{text}
		</Text>
	</View>
)

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
	<View className='mb-6'>
		{items.map((item, index) => (
			<BulletPoint key={index} text={item} />
		))}
	</View>
)

const RefundPolicyScreen = (): JSX.Element => {
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
						{`Refund Policy`}
					</Text>

					<Text variant='p2Roman' className='text-gray-700 mb-9'>
						{`Last Updated: September 19, 2024`}
					</Text>

					<Section title='Food Delivery Refund Policy' />

					<Section title='Eligibility' />
					<Paragraph text='You may be eligible for a refund in the following situations:' />

					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Incorrect Order: `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If you receive the wrong items or an incomplete order, you may request a refund.`}
								</Text>
							</Text>
						</View>
					</View>
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Late Delivery: `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If your order arrives later than the expected delivery window (1.5 hours), a refund may be offered.`}
								</Text>
							</Text>
						</View>
					</View>
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Damaged or Missing Items: `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If any items in your order are damaged or missing, we will provide a refund for the affected items.`}
								</Text>
							</Text>
						</View>
					</View>

					<Section title='How to Request a Refund' />
					<Paragraph text='To request a refund, please follow these steps:' />

					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`1. Contact our guest service team at `}
								<Pressable onPress={() => Linking.openURL('tel:+18447380342')}>
									<Text variant='p2Roman' className='text-blue-500'>
										+1 (844) 738-0342
									</Text>
								</Pressable>
								{` within 4 hours of receiving your order.`}
							</Text>
						</View>
					</View>
					<View className='mb-3'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`2. Provide the following information: `}
							</Text>
						</View>
					</View>
					<View className='mb-2'>
						<View className='flex-row ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`a. Order number`}
							</Text>
						</View>
					</View>
					<View className='mb-2'>
						<View className='flex-row  ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`b. A description of the issue`}
							</Text>
						</View>
					</View>
					<View className='mb-3'>
						<View className='flex-row ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`c. Photographic evidence (if applicable)`}
							</Text>
						</View>
					</View>
					<Paragraph text='3. Our customer service team will review your request and provide you with a resolution over the phone.' />

					<Section title='Refund Process' />
					<Paragraph text='If your refund request is approved, we will issue a refund to the original payment method. The processing time for refunds may take 3–5 business days, depending on your bank or payment provider.' />

					<Section title='Non-Refundable Situations' />
					<Paragraph text='Refunds will not be provided in the following cases:' />
					<BulletList
						items={[
							'Change of mind or dissatisfaction with personal taste preferences',
							'Orders that are not reported within the required timeframe (4 hours)',
							'Failure to follow delivery instructions that result in order issues',
							'Details for refund include an incorrect room number, item, or other selection'
						]}
					/>

					<Section title='Exceptions' />
					<Paragraph text='In some cases, we may offer credits or discounts for future orders instead of a full refund, depending on the situation.' />

					<Section title='Airport Transfer Refund Policy' />

					<Section title='Eligibility' />
					<Paragraph text='You may be eligible for a refund in the following situations:' />
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Incorrect Fare Charges: `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If you were charged incorrectly (e.g., overcharged, double-charged, or charged for an incorrect ride), you can request a refund.`}
								</Text>
							</Text>
						</View>
					</View>
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Cancellation Fees: `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If you were charged a cancellation fee in error (e.g., you did not cancel the ride or the driver canceled), you may be eligible for a refund.`}
								</Text>
							</Text>
						</View>
					</View>
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 w-4'>
								•
							</Text>
							<Text variant='p2Roman' className=' flex-1'>
								<Text variant='p2Roman' className='text-blue-700 '>
									{`Rides Not Completed:  `}
								</Text>
								<Text variant='p2Roman' className='text-gray-700'>
									{`If the ride was canceled or not completed due to reasons beyond your control, such as a mechanical issue or driver error, we may provide a refund.`}
								</Text>
							</Text>
						</View>
					</View>

					<Section title='How to Request a Refund' />
					<Paragraph text='To request a refund, please follow these steps:' />
					<View className='mb-6'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`1. Contact our guest service team at `}
								<Pressable onPress={() => Linking.openURL('tel:+18447380342')}>
									<Text variant='p2Roman' className='text-blue-500'>
										+1 (844) 738-0342
									</Text>
								</Pressable>
								{` within 4 hours of receiving your order.`}
							</Text>
						</View>
					</View>
					<View className='mb-3'>
						<View className='flex-row '>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`2. Provide the following information: `}
							</Text>
						</View>
					</View>
					<View className='mb-2'>
						<View className='flex-row ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`a. Ride ID or booking reference number`}
							</Text>
						</View>
					</View>
					<View className='mb-2'>
						<View className='flex-row  ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`b. A description of the issue or concern`}
							</Text>
						</View>
					</View>
					<View className='mb-3'>
						<View className='flex-row ml-6'>
							<Text variant='p2Roman' className='text-gray-700 flex-1'>
								{`c. Any supporting evidence, such as screenshots or photos (if applicable)`}
							</Text>
						</View>
					</View>
					<Paragraph text='3. Our customer service team will review your request and provide you with a resolution over the phone.' />

					<Section title='Refund Process' />
					<Paragraph
						text={`If your refund request is approved, we will process the refund to the original payment method. The refund may take 3–5 business days to appear in your account, depending on your payment provider.`}
					/>

					<Section title='Non-Refundable Situations' />
					<Paragraph text='Refunds will not be issued in the following cases:' />
					<BulletList
						items={[
							'Change of mind or dissatisfaction with the route or driver',
							'Delays caused by traffic, weather, or road conditions that are beyond our control',
							'Complaints or refund requests made after 3 days from the date of the ride',
							'Disputes related to passenger behavior or violations of the terms of service during the ride'
						]}
					/>
				</View>
			</ScrollView>
		</PageContainer>
	)
}

export default RefundPolicyScreen
