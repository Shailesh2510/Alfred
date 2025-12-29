import React from 'react'

interface PlusIconProperties {
	width?: string
	height?: string
	color?: string
}

export const PlusIcon: React.FC<PlusIconProperties> = ({
	width = '16',
	height = '16',
	color = '#2454A4'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 16 16'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M8 1L8 15'
				stroke={color}
				strokeWidth='2'
				strokeLinecap='round'
			/>
			<path
				d='M15 8L1 8'
				stroke={color}
				strokeWidth='2'
				strokeLinecap='round'
			/>
		</svg>
	)
}
