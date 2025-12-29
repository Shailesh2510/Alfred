import React from 'react'
import { Pressable, ActivityIndicator, View } from 'react-native'
import { Text } from './text'
import { cn } from '@/src/lib/utils'

interface LoadingButtonProperties {
	children: React.ReactNode
	onPress?: () => void
	isLoading?: boolean
	disabled?: boolean
	className?: string
}

export function LoadingButton({
	children,
	onPress,
	isLoading = false,
	disabled = false,
	className
}: LoadingButtonProperties) {
	const backgroundColor = disabled ? '#ABB3C1' : '#022867'
	const baseStyles = `px-6 py-3 rounded-lg active:bg-blue-700`

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || isLoading}
			style={{ backgroundColor }}
			className={cn(baseStyles, className)}
		>
			<View className='flex flex-row items-center justify-center gap-4'>
				{isLoading ? <ActivityIndicator color='white' /> : null}
				<Text variant='body' className='font-medium text-center text-white'>
					{children}
				</Text>
			</View>
		</Pressable>
	)
}
