import React from 'react'

interface EmptyBagIconProperties {
	width?: string
	height?: string
	color?: string
}

export const EmptyBagIcon: React.FC<EmptyBagIconProperties> = ({
	width = '20',
	height = '21',
	color = '#5B687D'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 20 21'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M10.0003 13.6335V10.3001M10.0003 6.9668H10.0087M18.3337 10.3001C18.3337 14.9025 14.6027 18.6335 10.0003 18.6335C5.39795 18.6335 1.66699 14.9025 1.66699 10.3001C1.66699 5.69776 5.39795 1.9668 10.0003 1.9668C14.6027 1.9668 18.3337 5.69776 18.3337 10.3001Z'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
