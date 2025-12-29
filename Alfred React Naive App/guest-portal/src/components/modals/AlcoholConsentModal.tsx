import React from 'react'
import { View, Modal, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { CloseIcon } from '@components/ui/icons/CloseIcon'

interface AlcoholConsentModalProperties {
	visible: boolean
	onClose: () => void
	onAgree: () => void
}

const AlcoholConsentModal: React.FC<AlcoholConsentModalProperties> = ({
	visible,
	onClose,
	onAgree
}) => {
	return (
		<Modal
			animationType='none'
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View className='flex-1 bg-black/50 justify-center items-center px-6'>
				<View className='w-full max-w-[350px] bg-white rounded-2xl overflow-hidden'>
					<View className='flex-row justify-between items-center px-6 py-[14] bg-gray-300'>
						<View className='w-8' />
						<Text variant='p1' className='text-gray-800 flex-1 text-center'>
							{`Important Information`}
						</Text>
						<Pressable onPress={onClose} className='items-end'>
							<CloseIcon />
						</Pressable>
					</View>

					<View className='px-6 py-8'>
						<Text variant='h1' className='text-center text-blue-700 mb-6'>
							{`ID required at the door`}
						</Text>

						<Text variant='p2Medium' className='text-gray-700 text-center mb-6'>
							{`Alcoholic beverages may be sold and delivered only to persons who are at least 21 years old and by placing your order with us, you represent and warrant to us that you are at least 21 years of age and that the person to whom delivery will be made is also at least 21 years of age to accept delivery.`}
						</Text>

						<Text
							variant='p2Heavy'
							className='font-bold text-gray-700 text-center'
						>
							{`Please be prepared to show a government issued ID to the courier during drop off to receive the order.`}
						</Text>
					</View>

					<View className='flex-row justify-between bg-white py-[12] px-[12]'>
						<Pressable onPress={onClose} className='px-[30] py-[10]'>
							<Text variant='h4' className='text-blue-500'>
								{`Go Back`}
							</Text>
						</Pressable>

						<Pressable
							onPress={onAgree}
							className='px-[30] py-[10] bg-blue-700 rounded-full'
						>
							<Text variant='h5' className='text-white'>
								{`Agree & Continue`}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default AlcoholConsentModal
