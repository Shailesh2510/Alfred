/* eslint-disable react-native/no-color-literals */
import { useState } from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text } from '@components/ui/text'

interface CustomSearchTextInputProperties {
	placeHolder: string
	value: string
	onChangeText: (value: any) => void
	disabled?: boolean
}

const CustomSearchTextInput = ({
	placeHolder,
	value,
	onChangeText,
	disabled = false
}: CustomSearchTextInputProperties): JSX.Element => {
	return (
		<View>
			<TextInput
				placeholder={placeHolder}
				value={value}
				id={`text-input-${placeHolder}`}
				disabled={disabled}
				onChange={onChangeText}
				autoFocus={true}
				style={{
					backgroundColor: '#FFFFFF',
					borderRadius: 8,
					borderWidth: 0,
					borderColor: '#D0D3DA',
					overflow: 'hidden',
					height: 40
				}}
				contentStyle={{
					fontSize: 16,
					color: '#052151',
					fontWeight: '400',
					fontFamily: 'Avenir-Roman',
					paddingTop: 0,
					paddingBottom: 0,
					marginTop: 0
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
			/>
		</View>
	)
}
export default CustomSearchTextInput
