import { View } from 'react-native'
import React from 'react'
import { Text } from '@components/ui/text'
import { NotificationBellIcon } from '@/src/components/ui/icons/NotificationBellIcon'
import { RideItem } from '@/src/types/ride-types'
import { LoadingButton } from '@/src/components/ui/LoadingButton'

type StickyCheckoutSectionProperties = {
	selectedRide: RideItem | null
	timeLeft: string
	buttonText?: string
	onProceed?: () => void
	isLoading?: boolean
	disabled?: boolean
}

const StickyCheckoutSection: React.FC<StickyCheckoutSectionProperties> = ({
	selectedRide,
	timeLeft,
	buttonText = 'Checkout',
	onProceed,
	isLoading = false,
	disabled = false
}) => {
	const isButtonDisabled = disabled || !selectedRide
	const buttonColorClass = selectedRide ? 'bg-[#022867]' : 'bg-[#ABB3C1]'
	return (
		<View className='sticky bottom-0 left-0 right-0 bg-white z-[50]'>
			<View className='px-[20] pt-[8] pb-[10]'>
				<LoadingButton
					isLoading={isLoading}
					disabled={isButtonDisabled}
					className={`rounded-full w-full h-[54] flex items-center justify-center ${buttonColorClass}`}
					onPress={onProceed}
				>
					<Text
						variant='p2Medium'
						className='font-extrabold text-white text-center'
					>
						{buttonText}
					</Text>
				</LoadingButton>
			</View>
			<View className='bg-utility-green50 pt-[9] pb-[10]'>
				<View className='flex-row items-center justify-center gap-[12]'>
					<NotificationBellIcon />
					<Text variant='p2Medium' className='text-utility-green500'>
						{`These prices will expire in ${timeLeft}`}
					</Text>
				</View>
			</View>
		</View>
	)
}

export default StickyCheckoutSection
