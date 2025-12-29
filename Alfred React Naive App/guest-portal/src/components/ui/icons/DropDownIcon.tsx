import React from 'react'

interface DropDownIconProperties {
	width?: string
	height?: string
	color?: string
}

export const DropDownIcon: React.FC<DropDownIconProperties> = ({
	width = '20',
	height = '20',
	color = '#022867'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 21 21'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M4.5 8.5L10.5 14.5L16.5 8.5'
				stroke={color}
				strokeWidth='1.8'
				strokeLinecap='round'
			/>
		</svg>
	)
}
