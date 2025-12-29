import React from 'react'

interface HamburgerMenuIconProperties {
	width?: string
	height?: string
	color?: string
}

export const HamburgerMenuIcon: React.FC<HamburgerMenuIconProperties> = ({
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
				d='M2 5H18'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
			<path
				d='M2 10H18'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
			<path
				d='M2 15H18'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
		</svg>
	)
}
