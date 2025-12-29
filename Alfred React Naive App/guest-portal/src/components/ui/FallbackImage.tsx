import { View } from 'react-native'
import { Text } from '@components/ui/text'
import { BLUE_150, BLUE_300 } from '@/src/utils/constants'
const AlfredLogo = ({ width = '62', height = '58', color = BLUE_300 }) => (
	<svg
		width={width}
		height={height}
		viewBox='0 0 62 58'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<g clipPath='url(#clip0_304_2593)'>
			<path
				d='M42.4998 1.35109C42.3184 0.841546 41.8348 0.496094 41.2907 0.496094H20.2009C19.6568 0.496094 19.1645 0.841546 18.9832 1.35972L0.0696613 55.7943C-0.223973 56.632 0.397841 57.5043 1.28738 57.5043H20.3822C20.9781 57.5043 21.4963 57.0898 21.6345 56.5111L22.8349 51.3898C22.9731 50.8112 23.4913 50.3966 24.0872 50.3966H37.7326C38.3112 50.3966 38.8294 50.7853 38.9762 51.3553L40.358 56.5543C40.5048 57.1157 41.0144 57.5129 41.6016 57.5129H60.7138C61.6033 57.5129 62.2251 56.632 61.9228 55.7943L42.4998 1.35109ZM29.649 38.0726L14.6218 45.6812C13.6805 46.1562 12.5664 45.4739 12.5664 44.4203V29.2032C12.5664 28.1495 13.6805 27.4673 14.6218 27.9423L29.649 35.5508C30.6853 36.0776 30.6853 37.5458 29.649 38.0726ZM49.4175 44.4203C49.4175 45.4739 48.3034 46.1562 47.362 45.6812L32.3349 38.0726C31.2985 37.5458 31.2985 36.0776 32.3349 35.5508L47.362 27.9423C48.3034 27.4673 49.4175 28.1495 49.4175 29.2032V44.4203Z'
				fill={color}
			/>
		</g>
		<defs>
			<clipPath id='clip0_304_2593'>
				<rect
					width='62'
					height='57.0082'
					fill='white'
					transform='translate(0 0.49707)'
				/>
			</clipPath>
		</defs>
	</svg>
)

const FallbackImage = ({
	containerStyle = {},
	aspectRatio = 1,
	logoSize = 62,
	textSize = 'regular',
	showText = true
}) => {
	const getTextVariant = () => {
		switch (textSize) {
			case 'small': {
				return 'p3'
			}
			case 'regular': {
				return 'p1'
			}
			case 'medium': {
				return 'h3'
			}
			case 'large': {
				return 'h1'
			}
			default: {
				return 'p1'
			}
		}
	}

	const getLogoSize = () => {
		const baseSize = logoSize
		switch (textSize) {
			case 'small': {
				return baseSize * 0.5
			}
			case 'regular': {
				return baseSize * 0.7
			}
			case 'medium': {
				return baseSize * 0.85
			}
			case 'large': {
				return baseSize
			}
			default: {
				return baseSize
			}
		}
	}

	const finalLogoSize = getLogoSize()

	return (
		<View
			style={[
				{
					aspectRatio,
					backgroundColor: BLUE_150,
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden'
				},
				containerStyle
			]}
		>
			<AlfredLogo
				width={String(finalLogoSize)}
				height={String(finalLogoSize * 0.935)}
				color={BLUE_300}
			/>
			{showText && (
				<Text
					variant={getTextVariant()}
					style={{
						color: BLUE_300,
						marginTop: textSize === 'small' ? 4 : 8,
						textAlign: 'center'
					}}
				>
					{`No Image Available`}
				</Text>
			)}
		</View>
	)
}

export default FallbackImage
