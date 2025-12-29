import React from 'react'

interface PhoneIconProperties {
	width?: string
	height?: string
	color?: string
}

export const PhoneIcon: React.FC<PhoneIconProperties> = ({
	width = '20',
	height = '20',
	color = '#052151'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M6.08887 11.9114C12.1187 17.9412 13.8855 16.4982 14.6747 15.9345C14.8022 15.8621 17.7229 13.9801 15.9065 12.1641C11.6936 7.95079 12.5484 13.4272 8.55994 9.43948C4.57232 5.45094 10.0491 6.3064 5.83625 2.09356C4.01964 0.276978 2.13746 3.19788 2.06587 3.3246C1.50138 4.11375 0.059035 5.88168 6.08887 11.9114Z'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
