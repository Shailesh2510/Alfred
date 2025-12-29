import React from 'react'
import { View, Modal, ActivityIndicator } from 'react-native'
import { Text } from '@components/ui/text'

interface PaymentInProgressModalProperties {
	visible: boolean
}

const PaymentInProgressModal: React.FC<PaymentInProgressModalProperties> = ({
	visible
}) => {
	return (
		<Modal animationType='none' transparent={true} visible={visible}>
			<View className='flex-1 bg-black/50 justify-center items-center'>
				<View className='w-full max-w-[350px] bg-white rounded-2xl overflow-hidden p-6 items-center'>
					<Text variant='p1' className='text-gray-800 text-center mb-4'>
						{`Processing Payment`}
					</Text>
					<ActivityIndicator size='large' color='#007bff' />
					<Text variant='p2Roman' className='text-gray-700 text-center mt-4'>
						{`Please wait while we process your payment.`}
					</Text>
				</View>
			</View>
		</Modal>
	)
}

export default PaymentInProgressModal
