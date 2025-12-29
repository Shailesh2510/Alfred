import React from 'react'

interface SchedulerClockIconProperties {
	width?: string
	height?: string
	color?: string
}

export const SchedulerClockIcon: React.FC<SchedulerClockIconProperties> = ({
	width = '20',
	height = '20',
	color = '#022867'
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
				d='M9.50065 4.49967V8.66634C9.50065 9.12657 9.87375 9.49967 10.334 9.49967L14.5006 9.49967M9.50065 17.4163C5.1284 17.4163 1.58398 13.8719 1.58398 9.49967C1.58398 5.12742 5.1284 1.58301 9.50065 1.58301C13.8729 1.58301 17.4173 5.12742 17.4173 9.49967C17.4173 13.8719 13.8729 17.4163 9.50065 17.4163Z'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
