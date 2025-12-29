export const formatPhoneNumber = (phoneNumber: string): string => {
	const hasPlus = phoneNumber.startsWith('+')
	const cleaned = phoneNumber.replaceAll(/\D/g, '')
	return hasPlus ? '+' + cleaned : cleaned
}
