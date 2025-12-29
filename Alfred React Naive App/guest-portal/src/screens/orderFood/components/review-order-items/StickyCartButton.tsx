import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'

interface StickyCartButtonProperties {
	text: string
	itemCount?: number
	price?: string
	onPress: () => void
	disabled?: boolean
	loading?: boolean
}

const StickyCartButton: React.FC<StickyCartButtonProperties> = ({
	itemCount = 0,
	price = '$0.00',
	text,
	onPress,
	disabled = false,
	loading = false
}) => {
	const backgroundColor = disabled ? '#ABB3C1' : '#022867'
	const badgeColor = disabled ? 'bg-gray-700' : 'bg-blue-500'

	return (
		<View className='sticky bottom-0 left-0 right-0 bg-white'>
			<View className='px-[20] py-[10]'>
				<Pressable
					onPress={onPress}
					disabled={disabled || loading}
					style={({ pressed }) => ({
						backgroundColor,
						borderRadius: 40,
						opacity: pressed || disabled ? 0.7 : 1,
						height: 56
					})}
				>
					<View className='flex-1 flex-row items-center justify-between px-4'>
						<View
							className={`${badgeColor} w-[38] h-[38] rounded-full items-center justify-center`}
						>
							<Text variant='p2Medium' className='text-white'>
								{itemCount}
							</Text>
						</View>

						<Text variant='p2Medium' className='text-white text-center'>
							{text}
						</Text>

						<View
							className={`${badgeColor} h-[38] w-[74] rounded-full items-center justify-center`}
						>
							<Text variant='p2Medium' className='text-white'>
								{price}
							</Text>
						</View>
					</View>
				</Pressable>
			</View>
		</View>
	)
}

export default StickyCartButton
