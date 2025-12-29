import React from 'react'

interface CancelIconProperties {
	width?: string
	height?: string
	color?: string
}

export const CancelIcon: React.FC<CancelIconProperties> = ({
	width = '32',
	height = '32',
	color = '#BA082B'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 32 32'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M6.94922 25.0518L25.0512 6.94982'
				stroke={color}
				strokeWidth='2.4'
				strokeLinecap='round'
			/>
			<path
				d='M6.94922 6.94824L25.0512 25.0502'
				stroke={color}
				strokeWidth='2.4'
				strokeLinecap='round'
			/>
		</svg>
	)
}
