import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'

interface TipSelectorProperties {
	selectedTip: number
	onSelectTip: (percentage: number) => void
}

const tipOptions = [
	{ label: 'None', value: 0 },
	{ label: '5%', value: 0.05 },
	{ label: '10%', value: 0.1 },
	{ label: '15%', value: 0.15 },
	{ label: '20%', value: 0.2 }
]

export const TipSelector: React.FC<TipSelectorProperties> = ({
	selectedTip,
	onSelectTip
}) => {
	return (
		<View className='flex-row justify-between w-full gap-2'>
			{tipOptions.map(option => (
				<Pressable
					key={option.value}
					onPress={() => onSelectTip(option.value)}
					className={`flex-1 py-3 rounded-lg items-center justify-center ${
						selectedTip === option.value ? 'bg-blue-700' : 'bg-blue-300'
					}`}
				>
					<View className='py-[12] px-[18]'>
						<Text
							variant='p3'
							className={
								selectedTip === option.value ? 'text-white' : 'text-blue-500'
							}
						>
							{option.label}
						</Text>
					</View>
				</Pressable>
			))}
		</View>
	)
}
