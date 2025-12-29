/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react'
import {
	Platform,
	View,
	Animated,
	TouchableWithoutFeedback
} from 'react-native'
import DatePicker from 'react-native-ui-datepicker'
import { Text } from '@components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { format, subDays } from 'date-fns'

interface CustomDatePickerProperties {
	label: string
	value: Date | null
	setValue: (date: Date) => void
	disabled?: boolean
}

const CustomDatePicker = ({
	label,
	value,
	setValue,
	disabled = false
}: CustomDatePickerProperties) => {
	const [isDatePickerVisible, setDatePickerVisible] = useState(false)
	const [animatedValue] = useState(new Animated.Value(value ? 1 : 0))

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: value ? 1 : 0,
			duration: 200,
			useNativeDriver: false
		}).start()
	}, [value, animatedValue])

	const placeholderTopPosition = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [17, 11]
	})

	const placeholderFontSize = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [18, 12]
	})

	const placeholderFontWeight = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['400', '400']
	})

	const formattedDate = value ? format(value, 'MMMM d, yyyy') : ''

	const toggleDatePicker = () => {
		if (!disabled) {
			setDatePickerVisible(!isDatePickerVisible)
		}
	}

	const handleDateChange = (selectedDate: any) => {
		if (!disabled) {
			const parsedDate =
				selectedDate instanceof Date
					? selectedDate
					: new Date(selectedDate.date)

			setValue(parsedDate)
			setDatePickerVisible(false)
		}
	}

	return (
		<TouchableWithoutFeedback onPress={toggleDatePicker}>
			<View style={{ marginTop: 6, marginBottom: 6, cursor: 'pointer' }}>
				<View
					style={{
						backgroundColor: '#FFFFFF',
						borderRadius: 8,
						borderWidth: 2,
						borderColor: '#D0D3DA',
						paddingHorizontal: 12,
						paddingTop: 28,
						paddingBottom: 5,
						height: 56,
						cursor: 'pointer',
						...(Platform.OS === 'web'
							? {
									WebkitTapHighlightColor: 'transparent',
									WebkitTouchCallout: 'none',
									WebkitUserSelect: 'none',
									userSelect: 'none'
								}
							: {})
					}}
				>
					<Text
						style={{
							fontSize: 16,
							color: disabled ? '#A0A8B5' : '#052151',
							fontFamily: 'Avenir-Roman',
							fontWeight: '400',
							paddingTop: 2
						}}
					>
						{formattedDate}
					</Text>
					<View style={{ position: 'absolute', right: 7, top: 12 }}>
						<Ionicons
							name={isDatePickerVisible ? 'chevron-up' : 'chevron-down'}
							size={24}
							color={disabled ? '#A0A8B5' : '#2454A4'}
						/>
					</View>
				</View>

				<Animated.Text
					style={{
						position: 'absolute',
						left: 12,
						backgroundColor: 'transparent',
						paddingHorizontal: 0,
						color: disabled ? '#A0A8B5' : '#5B687D',
						top: placeholderTopPosition,
						fontSize: placeholderFontSize,
						fontFamily: 'Avenir-Roman',
						fontWeight: placeholderFontWeight,
						zIndex: 1,
						pointerEvents: 'none'
					}}
				>
					{label}
				</Animated.Text>

				{isDatePickerVisible && (
					<View className='px-8 pb-6 mt-4 pt-6 bg-white border-2 border-gray-500 rounded-xl'>
						<DatePicker
							date={value || new Date()}
							onChange={handleDateChange}
							mode='single'
							locale='en'
							minDate={subDays(new Date(), 1)}
							selectedItemColor='#022867'
						/>
					</View>
				)}
			</View>
		</TouchableWithoutFeedback>
	)
}

export default CustomDatePicker
