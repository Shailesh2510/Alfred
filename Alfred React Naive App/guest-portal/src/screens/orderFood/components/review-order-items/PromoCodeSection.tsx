import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import CustomTextInputButtonField from '@components/ui/CustomTextInputButtonField'
import { TagIcon } from '@components/ui/icons/TagIcon'
import { useCartStore } from '@/src/store/useCartStore'

interface PromoCodeSectionProperties {
	onApply: (code: string) => Promise<void>
	appliedCode?: string
	isLoading?: boolean
	setShowInput: (showInput: boolean) => void
	showInput: boolean
}

export const PromoCodeSection: React.FC<PromoCodeSectionProperties> = ({
	onApply,
	appliedCode,
	isLoading,
	setShowInput,
	showInput
}) => {
	const { setVoucherCode, voucherCode } = useCartStore()

	const handleApply = () => {
		if (voucherCode.trim()) {
			onApply(voucherCode)
		}
	}

	const handleAddCode = () => {
		setShowInput(true)
	}

	if (showInput) {
		return (
			<View className='my-4'>
				<CustomTextInputButtonField
					label='Promo Code'
					value={voucherCode}
					onChangeText={setVoucherCode}
					buttonText={isLoading ? 'Validating...' : 'Apply'}
					onButtonPress={handleApply}
					autoFocus={true}
					disabled={isLoading}
				/>
			</View>
		)
	}

	if (!showInput && !appliedCode) {
		return (
			<Pressable
				onPress={handleAddCode}
				className='flex-row items-center py-[16] justify-center gap-[6]'
			>
				<TagIcon color='#2454A4' width='20' height='20' />
				<Text variant='p2Heavy' className='text-blue-500'>
					{`Add promo code`}
				</Text>
			</Pressable>
		)
	}

	return null
}
