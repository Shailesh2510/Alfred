import React from 'react'

interface TagIconProperties {
	width?: string
	height?: string
	color?: string
}

export const TagIcon: React.FC<TagIconProperties> = ({
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
				d='M5.83334 5.83366H5.84167M17.1583 11.1753L11.1833 17.1503C11.0286 17.3053 10.8447 17.4282 10.6424 17.5121C10.4401 17.596 10.2232 17.6391 10.0042 17.6391C9.78515 17.6391 9.56827 17.596 9.36594 17.5121C9.16361 17.4282 8.97979 17.3053 8.82501 17.1503L1.66667 10.0003V1.66699H10L17.1583 8.82533C17.4688 9.1376 17.643 9.56002 17.643 10.0003C17.643 10.4406 17.4688 10.8631 17.1583 11.1753Z'
				stroke={color}
				strokeWidth='1.66667'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
