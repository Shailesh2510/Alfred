/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text } from '@components/ui/text'

interface CustomTextInputProperties {
	label: string
	value: string
	onChangeText: (value: any) => void
	error?: any
	secureTextEntry?: boolean
	disabled?: boolean
	onPress?: () => void
}

const CustomTextInput = ({
	label,
	value,
	onChangeText,
	error,
	disabled = false,
	onPress
}: CustomTextInputProperties): JSX.Element => {
	return (
		<View>
			<TextInput
				label={label}
				value={value}
				id={`text-input-${label}`}
				disabled={disabled}
				onChange={onChangeText}
				style={{
					backgroundColor: '#FFFFFF',
					borderRadius: 8,
					borderWidth: 2,
					borderColor: error ? '#BA082B' : '#D0D3DA',
					overflow: 'hidden'
				}}
				contentStyle={{
					fontSize: 16,
					color: '#052151',
					fontWeight: '400',
					fontFamily: 'Avenir-Roman'
				}}
				theme={{
					colors: {
						primary: '#5B687D',
						error: '#BA082B',
						text: '#5B687D',
						placeholder: '#5B687D',
						onSurfaceVariant: '#5B687D'
					},
					roundness: 8
				}}
				underlineStyle={{ display: 'none' }}
				outlineStyle={{
					borderWidth: 0,
					borderRadius: 8
				}}
				error={!!error && error?.message}
			/>
			{error && (
				<Text variant='p2Medium' className='text-[#BA082B] mt-2 px-4'>
					{error?.message}
				</Text>
			)}
		</View>
	)
}

export default CustomTextInput
