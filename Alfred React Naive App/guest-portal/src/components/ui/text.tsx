import { Text as RNText, TextStyle } from 'react-native'
import { cn } from '@lib/utils'
import { useTheme } from '@context/theme-context'

interface TextProperties {
	variant?:
		| 'h1'
		| 'h2'
		| 'h3'
		| 'h4'
		| 'h5'
		| 'body'
		| 'p1'
		| 'p2Heavy'
		| 'p2Medium'
		| 'p2Larger'
		| 'p2Roman'
		| 'p3'
	children: React.ReactNode
	className?: string
	numberOfLines?: number
	style?: TextStyle
}
export function Text({
	variant = 'body',
	children,
	className,
	numberOfLines,
	style
}: TextProperties) {
	const { theme } = useTheme()

	const baseStyles = {
		h1: `font-bold font-TradeGothicNextProBdCn text-[28px]`,
		h2: `font-semibold font-TradeGothicNextProBdCn text-[24px]`,
		h3: `font-medium font-TradeGothicNextProCn text-[21px]`,
		h4: `font-medium font-AvenirHeavy text-[17px]`,
		h5: `font-medium font-AvenirHeavy text-[16px]`,
		p1: `font-medium font-AvenirMedium text-[17px]`,
		p2Heavy: `font-medium font-AvenirHeavy text-[14px]`,
		p2Medium: `font-medium font-AvenirMedium text-[14px]`,
		p2Larger: `font-medium font-AvenirMedium text-[16px]`,
		p2Roman: `font-medium font-AvenirRoman text-[14px]`,
		p3: `font-medium font-AvenirRoman text-[13px]`,
		body: `font-normal font-AvenirRoman text-base`
	}[variant]

	const themeColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'

	return (
		<RNText
			className={cn(baseStyles, className)}
			numberOfLines={numberOfLines}
			style={style}
		>
			{children}
		</RNText>
	)
}
