import React from 'react'

interface QuestionMarkIconProperties {
	width?: string
	height?: string
	color?: string
}

export const QuestionMarkIcon: React.FC<QuestionMarkIconProperties> = ({
	width = '17',
	height = '16',
	color = '#052151'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 17 16'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<circle
				cx='8.49961'
				cy='8.00059'
				r='6.4'
				stroke={color}
				strokeWidth='1.2'
			/>
			<path
				d='M6.90039 5.82815C7.12896 4.34244 9.87182 4.34244 10.1004 5.82815C10.329 7.31386 8.44325 7.31387 8.44325 8.51387'
				stroke={color}
				strokeWidth='1.2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M8.5048 11.2002H8.5V11.2053H8.5048V11.2002Z'
				stroke={color}
				strokeWidth='1.24444'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<circle
				cx='8.49905'
				cy='11.085'
				r='0.114286'
				stroke={color}
				strokeWidth='1.2'
			/>
		</svg>
	)
}
