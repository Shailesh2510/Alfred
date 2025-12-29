/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react'
import {
	Platform,
	View,
	Animated,
	TouchableWithoutFeedback
} from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { Text } from '@components/ui/text'
import { Ionicons } from '@expo/vector-icons'

interface DropdownOption {
	value: string
	label: string
}

interface CustomElementDropdownProperties {
	label: string
	value: string
	setValue: (value: string | undefined) => void
	options: DropdownOption[]
	disabled?: boolean
}
interface DropdownReference {
	open: () => void
	close: () => void
}

const CustomElementDropdown = ({
	value,
	label,
	setValue,
	options,
	disabled = false
}: CustomElementDropdownProperties) => {
	const [isOpen, setIsOpen] = useState(false)
	const [animatedValue] = useState(new Animated.Value(value ? 1 : 0))
	const dropdownReference = useRef<DropdownReference | null>(null)
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

	const renderItem = (item: DropdownOption) => {
		return (
			<View className='mx-4 my-2'>
				<Text variant='p2Larger' className='text-gray-800'>
					{item.label}
				</Text>
			</View>
		)
	}

	const handleChange = (item: any) => {
		if (!disabled) {
			setValue(item.value)
			setIsOpen(false)
		}
	}

	const toggleDropdown = () => {
		if (!disabled) {
			setIsOpen(!isOpen)
			if (dropdownReference.current) {
				if (isOpen) dropdownReference.current.close()
				else dropdownReference.current.open()
			}
		}
	}

	const selectedLabel =
		options.find(option => option.value === value)?.label || ''

	return (
		<TouchableWithoutFeedback onPress={toggleDropdown}>
			<View style={{ marginTop: 6, marginBottom: 6, cursor: 'pointer' }}>
				<Dropdown
					ref={dropdownReference}
					style={{
						backgroundColor: '#FFFFFF',
						borderRadius: 8,
						borderWidth: 2,
						borderColor: '#D0D3DA',
						paddingHorizontal: 12,
						paddingTop: 22,
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
					selectedTextStyle={{
						fontSize: 16,
						color: '#052151',
						fontFamily: 'Avenir-Roman',
						fontWeight: '400'
					}}
					data={options}
					maxHeight={200}
					labelField='label'
					valueField='value'
					placeholder=''
					search={false}
					onFocus={() => {
						if (!disabled) {
							setIsOpen(true)
						}
					}}
					onBlur={() => {
						setIsOpen(false)
					}}
					onChange={handleChange}
					renderItem={renderItem}
					showsVerticalScrollIndicator={false}
					disable={disabled}
					renderLeftIcon={() => null}
					renderRightIcon={() => (
						<View style={{ marginRight: -5, marginTop: -12 }}>
							<Ionicons
								name={isOpen ? 'chevron-up' : 'chevron-down'}
								size={24}
								color={disabled ? '#A0A8B5' : '#2454A4'}
							/>
						</View>
					)}
					containerStyle={{
						backgroundColor: 'white',
						borderRadius: 8,
						marginTop: 4,
						borderColor: '#D0D3DA',
						cursor: 'pointer',
						overflow: 'hidden'
					}}
					itemContainerStyle={{
						backgroundColor: 'white',
						cursor: 'pointer'
					}}
					itemTextStyle={{
						fontSize: 12,
						color: '#052151',
						fontFamily: 'Avenir-Roman',
						fontWeight: '600'
					}}
					activeColor='transparent'
					flatListProps={{
						showsVerticalScrollIndicator: false,
						scrollEnabled: true,
						keyboardShouldPersistTaps: 'handled',
						maintainVisibleContentPosition: {
							minIndexForVisible: 0
						}
					}}
				/>
				<Text
					style={{
						position: 'absolute',
						left: 14,
						top: 28,
						fontSize: 16,
						fontFamily: 'Avenir-Roman',
						fontWeight: '400',
						color: disabled ? '#A0A8B5' : '#052151',
						zIndex: 0,
						pointerEvents: 'none',
						paddingTop: 2
					}}
				>
					{selectedLabel}
				</Text>

				<Animated.Text
					style={{
						position: 'absolute',
						left: 14,
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
			</View>
		</TouchableWithoutFeedback>
	)
}

export default CustomElementDropdown
