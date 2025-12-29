import React from 'react'

interface ConfirmIconProperties {
	width?: string
	height?: string
	color?: string
}

export const ConfirmIcon: React.FC<ConfirmIconProperties> = ({
	width = '32',
	height = '32',
	color = '#0A6555'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 33 32'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M27.1673 8L12.5007 22.6667L5.83398 16'
				stroke={color}
				strokeWidth='2.66667'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
