import React from 'react'
import { View } from 'react-native'
import { Text } from '@components/ui/text'
import { LoadingButton } from '@/src/components/ui/LoadingButton'

interface StickyCheckoutButtonProperties {
	onPress: () => void
	disabled?: boolean
	loading?: boolean
	buttonText?: string
}

export const StickyCheckoutButton: React.FC<StickyCheckoutButtonProperties> = ({
	onPress,
	disabled = false,
	loading = false,
	buttonText = 'Checkout'
}) => {
	return (
		<View className='sticky bottom-0 left-0 right-0 bg-white'>
			<View className='px-[20] pt-[8] pb-[10]'>
				<LoadingButton
					isLoading={loading}
					disabled={disabled}
					className={`rounded-full w-full h-[54] flex items-center justify-center`}
					onPress={onPress}
				>
					<Text
						variant='p2Medium'
						className='font-extrabold text-white text-center '
					>
						{buttonText}
					</Text>
				</LoadingButton>
			</View>
		</View>
	)
}
