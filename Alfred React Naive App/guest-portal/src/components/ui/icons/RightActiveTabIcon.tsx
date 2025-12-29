import React from 'react'

interface RightActiveTabIconProperties {
	width?: string
	height?: string
	color?: string
}

export const RightActiveTabIcon: React.FC<RightActiveTabIconProperties> = ({
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
				d='M16 7.76795C17.3333 8.53775 17.3333 10.4623 16 11.2321L7.75 15.9952C6.41667 16.765 4.75 15.8027 4.75 14.2631L4.75 4.73686C4.75 3.19726 6.41667 2.23501 7.75 3.00481L16 7.76795Z'
				fill={color}
			/>
		</svg>
	)
}
