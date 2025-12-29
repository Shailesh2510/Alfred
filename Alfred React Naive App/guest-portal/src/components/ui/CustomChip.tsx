import React from 'react'
import { Pressable, View } from 'react-native'
import { cn } from '@/src/lib/utils'

interface CustomChipProperties {
	children: React.ReactNode
	className?: string
	icon?: React.ReactNode
	onPress?: () => void
	containerClassName?: string
}

export function CustomChip({
	children,
	className,
	icon,
	onPress,
	containerClassName
}: CustomChipProperties) {
	const ChipContainer = onPress ? Pressable : View

	return (
		<ChipContainer
			onPress={onPress}
			className={cn(
				'm-0 p-0',
				onPress && 'cursor-pointer active:opacity-70',
				containerClassName
			)}
		>
			<View className={cn('flex-row items-center m-0 p-0', className)}>
				{icon && <View className='m-0 p-0'>{icon}</View>}
				{children}
			</View>
		</ChipContainer>
	)
}
