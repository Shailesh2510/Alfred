import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { PageContainer } from '@components/ui/page-container'
import AlcoholConsentModal from '@/src/components/modals/AlcoholConsentModal'

const AlcoholModal = (): JSX.Element => {
	const [isModalVisible, setIsModalVisible] = useState(false)

	const handleAgree = () => {
		setIsModalVisible(false)
	}

	return (
		<PageContainer>
			<View className='flex-1 justify-center items-center'>
				<Text variant='h1'>{`Verification Model`}</Text>
				<Pressable
					onPress={() => setIsModalVisible(true)}
					className='mt-4 mx-6 bg-blue-700 py-3 px-6 rounded-full'
				>
					<Text variant='h5' className='text-white text-center'>
						Show ID Verification
					</Text>
				</Pressable>

				<AlcoholConsentModal
					visible={isModalVisible}
					onClose={() => setIsModalVisible(false)}
					onAgree={handleAgree}
				/>
			</View>
		</PageContainer>
	)
}

export default AlcoholModal
