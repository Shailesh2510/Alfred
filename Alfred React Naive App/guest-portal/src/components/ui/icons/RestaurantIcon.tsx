import React from 'react'

interface RestaurantIconProperties {
	width?: string
	height?: string
	color?: string
}

export const RestaurantIcon: React.FC<RestaurantIconProperties> = ({
	width = '25',
	height = '24',
	color = '#ABB3C1'
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 25 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M5.36412 9.95622C3.58045 8.17255 3.58045 5.35984 5.36412 3.57617L12.979 11.1911L15.5173 13.7294L19.4277 17.6397C20.1137 18.3258 20.1137 19.3548 19.4277 20.0408C18.7416 20.7268 17.5068 20.7268 16.8894 19.9036L14.0767 16.4049C13.3906 15.513 12.1558 15.2386 11.0581 15.6502L5.36412 9.95622Z'
				stroke={color}
				strokeWidth='1.8'
				strokeMiterlimit='10'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M15.5181 8.99361L19.2226 5.28906'
				stroke={color}
				strokeWidth='1.73312'
				strokeMiterlimit='10'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M14.0054 12.2211C14.2798 12.1525 14.4856 12.1525 14.76 12.0839C15.6518 12.0153 16.6809 11.5351 17.7099 10.5061L21.0714 7.14453'
				stroke={color}
				strokeWidth='1.73312'
				strokeMiterlimit='10'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M9.3425 13.9326L4.54031 17.843C3.78568 18.3918 3.71708 19.4894 4.40311 20.1069C5.08913 20.7929 6.11817 20.6557 6.667 19.9697L10.5773 15.0989'
				stroke={color}
				strokeWidth='1.73312'
				strokeMiterlimit='10'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M17.3708 3.42871L13.9407 6.79024C12.9116 7.81928 12.3628 8.84832 12.3628 9.74016C12.3628 10.0146 12.2942 10.2204 12.2256 10.4948'
				stroke={color}
				strokeWidth='1.73312'
				strokeMiterlimit='10'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}
