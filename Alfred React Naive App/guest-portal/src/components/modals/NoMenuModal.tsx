import React from 'react'
import { View, Modal, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { CloseIcon } from '@components/ui/icons/CloseIcon'

interface NoMenuModalProperties {
	visible: boolean
	onClose: () => void
}

const NoMenuModal: React.FC<NoMenuModalProperties> = ({ visible, onClose }) => {
	return (
		<Modal
			animationType='none'
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View className='flex-1 bg-black/50 justify-center items-center'>
				<View className='w-full max-w-[350px] bg-white rounded-2xl overflow-hidden'>
					<View className='flex-row justify-between items-center py-[14] bg-gray-300'>
						<Text variant='p1' className='text-gray-800 flex-1 text-center'>
							{`Schedule A New Time`}
						</Text>
						<Pressable onPress={onClose} className='absolute right-4'>
							<CloseIcon />
						</Pressable>
					</View>

					<View>
						<Text
							variant='h1'
							className='text-center text-blue-700 pt-[40] pb-[24]'
						>
							{`No menu found`}
						</Text>
						<View>
							<Text
								variant='p2Roman'
								className='text-gray-700 text-center pb-[40] px-[24]'
							>
								{`The restaurant isn't open at the selected time. Please try scheduling a different time to proceed.`}
							</Text>
						</View>
					</View>
					<View className='flex-row justify-center bg-white py-[12]'>
						<Pressable
							onPress={() => {
								onClose()
							}}
							className='bg-blue-700 py-[12] px-[142] rounded-full'
						>
							<Text variant='h5' className='font-bold text-white text-center'>
								{`Got It`}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default NoMenuModal
