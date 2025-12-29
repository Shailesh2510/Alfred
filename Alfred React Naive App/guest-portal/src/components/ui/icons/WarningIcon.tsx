import React from 'react'

interface WarningIconProperties {
	width?: string
	height?: string
	color?: string
}

export const WarningIcon: React.FC<WarningIconProperties> = ({
	width = '40',
	height = '40',
	color = 'white'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 40 40'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<g clipPath='url(#clip0_1142_8489)'>
				<path
					d='M19.9995 14.9994V21.666M19.9995 28.3327H20.0162M17.1495 6.4327L3.03288 29.9994C2.74183 30.5034 2.58782 31.0749 2.58619 31.6569C2.58457 32.2389 2.73536 32.8112 3.02359 33.3169C3.31182 33.8226 3.72742 34.2439 4.22906 34.5391C4.7307 34.8343 5.30088 34.993 5.88288 34.9994H34.1162C34.6982 34.993 35.2684 34.8343 35.77 34.5391C36.2717 34.2439 36.6873 33.8226 36.9755 33.3169C37.2637 32.8112 37.4145 32.2389 37.4129 31.6569C37.4113 31.0749 37.2573 30.5034 36.9662 29.9994L22.8495 6.4327C22.5524 5.94288 22.1341 5.5379 21.6349 5.25684C21.1357 4.97578 20.5724 4.82812 19.9995 4.82812C19.4267 4.82813 18.8634 4.97578 18.3642 5.25684C17.865 5.5379 17.4467 5.94288 17.1495 6.4327Z'
					stroke={color}
					strokeWidth='3.33333'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</g>
			<defs>
				<clipPath id='clip0_1142_8489'>
					<rect width='40' height='40' fill='white' />
				</clipPath>
			</defs>
		</svg>
	)
}
