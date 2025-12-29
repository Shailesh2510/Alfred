import React from 'react'

interface AddIconProperties {
	width?: string
	height?: string
	color?: string
}

export const AddIcon: React.FC<AddIconProperties> = ({
	width = '21',
	height = '21',
	color = '#2454A4'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 21 21'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M10.5003 7.26758V13.9342M7.16699 10.6009H13.8337M18.8337 10.6009C18.8337 15.2033 15.1027 18.9342 10.5003 18.9342C5.89795 18.9342 2.16699 15.2033 2.16699 10.6009C2.16699 5.99854 5.89795 2.26758 10.5003 2.26758C15.1027 2.26758 18.8337 5.99854 18.8337 10.6009Z'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
