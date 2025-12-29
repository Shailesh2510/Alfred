/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import { useEffect, useRef } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Text } from '@components/ui/text'

interface CustomTextInputButtonFieldProperties {
	label: string
	value: string
	onChangeText: (value: string) => void
	error?: any
	secureTextEntry?: boolean
	disabled?: boolean
	onPress?: () => void
	buttonText: string
	onButtonPress: () => void
	buttonDisabled?: boolean
	isLoading?: boolean
	autoFocus?: boolean
}

const CustomTextInputButtonField = ({
	label,
	value,
	onChangeText,
	error,
	disabled = false,
	buttonText,
	onButtonPress,
	buttonDisabled = false,
	isLoading = false,
	autoFocus = false
}: CustomTextInputButtonFieldProperties): JSX.Element => {
	const inputReference = useRef<any>(null)

	useEffect(() => {
		if (autoFocus && inputReference.current) {
			requestAnimationFrame(() => {
				inputReference.current?.focus()
			})
		}
	}, [autoFocus])

	return (
		<View>
			<View style={{ position: 'relative' }}>
				<TextInput
					ref={inputReference}
					label={label}
					value={value}
					id={`text-input-${label}`}
					disabled={disabled}
					onChangeText={onChangeText}
					autoFocus={autoFocus}
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
						paddingRight: 100
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
				<Pressable
					onPress={onButtonPress}
					disabled={buttonDisabled}
					style={{
						position: 'absolute',
						right: 8,
						top: '50%',
						transform: [{ translateY: -20 }],
						backgroundColor: buttonDisabled ? '#D0D3DA' : '#022867',
						alignItems: 'center',
						justifyContent: 'center',
						minWidth: 80,
						height: 40,
						borderRadius: 4
					}}
				>
					{isLoading ? (
						<ActivityIndicator color='#FFF' />
					) : (
						<Text variant='p3' className='font-bold text-white'>
							{buttonText}
						</Text>
					)}
				</Pressable>
			</View>
		</View>
	)
}

export default CustomTextInputButtonField
