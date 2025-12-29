import { phone } from 'phone'

const validateCountryPhoneNumber = (phoneNumber: string) => {
	if (phoneNumber.length === 0) {
		return {
			isValid: false,
			errorMessage: 'Phone number is required'
		}
	}

	const isValidPhoneNumber = phone(phoneNumber).isValid
	if (isValidPhoneNumber) {
		return {
			isValid: true,
			errorMessage: ''
		}
	}

	return {
		isValid: false,
		errorMessage: 'Please enter a valid phone number'
	}
}

export default validateCountryPhoneNumber
