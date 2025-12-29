import React from 'react'

interface BellIconProperties {
	width?: string
	height?: string
	color?: string
}

export const BellIcon: React.FC<BellIconProperties> = ({
	width = '28',
	height = '28',
	color = '#B4BCC9'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 28 28'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M13.9998 3.5C11.0774 3.5 8.70836 5.91077 8.70836 8.88461C8.70836 10.0052 8.91863 10.9109 8.2975 12.9231C8.06881 13.6639 7.13923 15.1674 6.15836 16.6345C5.09414 18.2262 6.20846 20.4167 8.12321 20.4167C12.041 20.4167 15.9587 20.4167 19.8764 20.4167C21.7912 20.4167 22.9055 18.2262 21.8413 16.6345C20.8604 15.1674 19.9308 13.6639 19.7022 12.9231C19.081 10.9109 19.2913 10.0052 19.2913 8.88461C19.2913 5.91077 16.9222 3.5 13.9998 3.5ZM13.9998 3.5V1.75M17.4998 20.4167V21C17.4998 23.3196 15.9328 24.5 13.9998 24.5C12.0668 24.5 10.4998 23.3196 10.4998 21V20.4167'
				stroke={color}
				strokeWidth='2.1'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
