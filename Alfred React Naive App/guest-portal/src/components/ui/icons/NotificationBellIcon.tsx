import React from 'react'

interface NotificationBellIconProperties {
	width?: string
	height?: string
	color?: string
}

export const NotificationBellIcon: React.FC<NotificationBellIconProperties> = ({
	width = '20',
	height = '20',
	color = '#0A6555'
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
				d='M9.99987 2.5C7.91245 2.5 6.22025 4.22198 6.22025 6.34615C6.22025 7.14658 6.37045 7.79347 5.92678 9.23077C5.76343 9.75995 5.09945 10.8338 4.39883 11.8818C3.63867 13.0187 4.43461 14.5833 5.80229 14.5833C8.60068 14.5833 11.3991 14.5833 14.1975 14.5833C15.5651 14.5833 16.3611 13.0187 15.6009 11.8818C14.9003 10.8338 14.2363 9.75995 14.073 9.23077C13.6293 7.79347 13.7795 7.14658 13.7795 6.34615C13.7795 4.22198 12.0873 2.5 9.99987 2.5ZM9.99987 2.5V1.25M12.4999 14.5833V15C12.4999 16.6569 11.3806 17.5 9.99988 17.5C8.61916 17.5 7.49988 16.6569 7.49988 15V14.5833'
				stroke={color}
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
