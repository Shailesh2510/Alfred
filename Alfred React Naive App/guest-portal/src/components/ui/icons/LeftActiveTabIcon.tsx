import React from 'react'

interface LeftActiveTabIconProperties {
	width?: string
	height?: string
	color?: string
}

export const LeftActiveTabIcon: React.FC<LeftActiveTabIconProperties> = ({
	width = '19',
	height = '19',
	color = '#2454A4'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 19 19'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M3 11.2321C1.66667 10.4623 1.66667 8.53775 3 7.76795L11.25 3.00481C12.5833 2.23501 14.25 3.19726 14.25 4.73686L14.25 14.2631C14.25 15.8027 12.5833 16.765 11.25 15.9952L3 11.2321Z'
				fill={color}
			/>
		</svg>
	)
}
