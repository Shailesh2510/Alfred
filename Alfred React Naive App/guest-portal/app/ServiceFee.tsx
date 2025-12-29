import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { PageContainer } from '@components/ui/page-container'
import ServiceFeeModal from '@components/modals/ServiceFeeModal'

const ServiceFeePage = (): JSX.Element => {
	const [isModalVisible, setIsModalVisible] = useState(false)

	return (
		<PageContainer>
			<View className='flex-1 justify-center items-center'>
				<Text variant='h1'>{`Service Fee Information`}</Text>
				<Pressable
					onPress={() => setIsModalVisible(true)}
					className='mt-4 mx-6 bg-blue-700 py-3 px-6 rounded-full'
				>
					<Text variant='h5' className='text-white text-center'>
						{`Show Service Fee Information`}
					</Text>
				</Pressable>

				<ServiceFeeModal
					visible={isModalVisible}
					onClose={() => setIsModalVisible(false)}
				/>
			</View>
		</PageContainer>
	)
}

export default ServiceFeePage
