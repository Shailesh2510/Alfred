import React from 'react'

interface CommentIconProperties {
	width?: string
	height?: string
	color?: string
}

export const CommentIcon: React.FC<CommentIconProperties> = ({
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
				fillRule='evenodd'
				clipRule='evenodd'
				d='M16.2308 5.57602H3.76923C3.00453 5.57602 2.38462 6.19593 2.38462 6.96063V12.4991C2.38462 13.2638 3.00453 13.8837 3.76923 13.8837H7.23069L6.62054 15.2761L9.92541 13.8837H16.2308C16.9955 13.8837 17.6154 13.2638 17.6154 12.4991V6.96064C17.6154 6.19594 16.9955 5.57602 16.2308 5.57602ZM9.92541 13.8837L9.92572 13.8836L7.23073 13.8836L7.23069 13.8837H9.92541ZM3.76923 4.19141C2.23983 4.19141 1 5.43123 1 6.96063V12.4991C1 14.0285 2.23983 15.2683 3.76923 15.2683H4.97465L3.38179 18.0453L9.30071 15.2683H16.2308C17.7602 15.2683 19 14.0285 19 12.4991V6.96064C19 5.43123 17.7602 4.19141 16.2308 4.19141H3.76923Z'
				fill={color}
			/>
		</svg>
	)
}
