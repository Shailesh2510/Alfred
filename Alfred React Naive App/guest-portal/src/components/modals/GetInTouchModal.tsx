import React from 'react'
import { View, Modal, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { Linking } from 'react-native'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { CloseIcon } from '@icons/CloseIcon'

const handleCall = (): void => {
	Linking.openURL('tel:+18447380342')
}

export const GetInTouchModal = (): JSX.Element => {
	const { phoneModalVisible, setPhoneModalVisible } = useGlobalStore()
	return (
		<Modal
			animationType='fade'
			transparent={true}
			visible={phoneModalVisible}
			onRequestClose={() => setPhoneModalVisible(false)}
		>
			<View className='flex-1  bg-black/50 justify-center items-center px-6'>
				<View className='w-full max-w-[353px] bg-white rounded-2xl overflow-hidden'>
					<View className='bg-gray-300 flex-row justify-center items-center relative py-5'>
						<Text variant='p1' className='text-gray-800 '>
							Get In Touch
						</Text>
						<Pressable
							onPress={() => setPhoneModalVisible(false)}
							className='justify-center items-center absolute right-6'
						>
							<CloseIcon height='20' width='20' />
						</Pressable>
					</View>
					<View className='px-6 pt-24 pb-4'>
						<Text variant='h1' className='text-blue-700 text-center mb-4'>
							{`We're here to help`}
						</Text>
						<Text variant='p2Roman' className='text-gray-700 text-center mb-4'>
							Do you have any questions about an order or need assistance
							booking a ride?
						</Text>
						<View className='flex-row items-center justify-center space-x-1 mb-36'>
							<Text variant='p2Roman' className='text-gray-700'>
								{`We're available 24/7:`}
							</Text>
							<Text variant='p2Heavy' className='text-blue-500'>
								+1 (844) 738-0342
							</Text>
						</View>
						<View className='flex-row space-x-3'>
							<Pressable
								onPress={() => setPhoneModalVisible(false)}
								className='flex-1 h-12 justify-center items-center'
							>
								<Text variant='h4' className='text-blue-500'>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								onPress={handleCall}
								className='flex-1 h-12 bg-blue-700 justify-center items-center rounded-full'
							>
								<Text variant='h5' className='text-white'>
									Call Now
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	)
}
