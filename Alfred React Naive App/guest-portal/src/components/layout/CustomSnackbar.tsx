import React, { ReactNode, useEffect } from 'react'
import { View } from 'react-native'

interface SnackbarProperties {
	children: ReactNode
	visible?: boolean
	onDismiss?: () => void
	duration?: number
}

const Snackbar = ({
	children,
	visible = true,
	onDismiss,
	duration
}: SnackbarProperties) => {
	if (!visible) {
		return null
	}

	useEffect(() => {
		if (duration && visible && onDismiss) {
			const timer = setTimeout(() => {
				onDismiss()
			}, duration)

			return () => clearTimeout(timer)
		}
	}, [duration, visible, onDismiss])

	return (
		<View className='absolute bottom-0 w-full'>
			<View className='flex-row justify-between m-0 rounded-md p-4'>
				<View className='flex-1'>{children}</View>
				<View className='items-center'></View>
			</View>
		</View>
	)
}

export default Snackbar
