import React from 'react'

interface CloseIconProperties {
	width?: string
	height?: string
	color?: string
}

export const CloseIcon: React.FC<CloseIconProperties> = ({
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
				d='M4.34314 15.6572L15.6568 4.34352'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
			<path
				d='M4.34326 4.34277L15.657 15.6565'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
		</svg>
	)
}
