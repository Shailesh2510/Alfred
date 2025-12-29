/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { View } from 'react-native'
import { Text } from '@components/ui/text'
import PhoneInput from 'react-phone-input-2'

const StyledCountryPhoneNumber = ({
	onChange,
	isDisabled = false,
	value,
	label,
	name,
	countryCodeEditable = false,
	onKeyDown,
	error
}: any) => {
	return (
		<View>
			<PhoneInput
				onKeyDown={onKeyDown}
				disabled={isDisabled}
				country={'us'}
				placeholder='(---) --- ----'
				enableSearch={true}
				disableSearchIcon={true}
				value={value}
				onChange={onChange}
				inputProps={{
					label: label,
					name: name
				}}
				searchPlaceholder='Search Country'
				preferredCountries={['us']}
				countryCodeEditable={countryCodeEditable}
				containerStyle={{ width: '100%' }}
				inputStyle={{
					width: '100%',
					height: '56px',
					fontFamily: 'Avenir-Medium',
					color: '#052151',
					fontSize: 16,
					borderRadius: 8,
					borderWidth: 2
				}}
				searchStyle={{
					width: '90%',
					borderRadius: 8,
					borderWidth: 2
				}}
				buttonStyle={{
					borderTopLeftRadius: 8,
					borderBottomLeftRadius: 8,
					borderWidth: 2
				}}
				dropdownStyle={{
					maxHeight: '200px',
					borderRadius: 8
				}}
			/>
			{error && (
				<Text variant='p2Medium' className='text-[#BA082B] mt-2 px-4'>
					{error?.message}
				</Text>
			)}
		</View>
	)
}

export default StyledCountryPhoneNumber
