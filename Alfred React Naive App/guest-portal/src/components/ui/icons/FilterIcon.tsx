import React from 'react'

interface FilterIconProperties {
	width?: string
	height?: string
	color?: string
}

export const FilterIcon: React.FC<FilterIconProperties> = ({
	width = '20',
	height = '20',
	color = '#022867'
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
				d='M16.6663 4H3.33301L8.66634 10.3067V14.6667L11.333 16V10.3067L16.6663 4Z'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
