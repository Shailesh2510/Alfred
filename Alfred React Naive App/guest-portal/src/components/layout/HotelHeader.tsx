import React from 'react'
import { View } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { LocationIcon } from '@icons/LocationIcon'
import { WHITE } from '@/src/utils/constants'
interface HotelHeaderProperties {
	hotelName: string
	hotelId: string
}

export function HotelHeader({ hotelName, hotelId }: HotelHeaderProperties) {
	return (
		<View className='bg-blue-600 py-[16]'>
			<View className='flex-1'>
				<View className='flex-row items-center justify-center'>
					<LocationIcon color={WHITE} />
					<Text
						variant='h3'
						className='text-white text-center flex-shrink max-w-[286px]'
						numberOfLines={2}
					>
						{hotelName}
					</Text>
				</View>
			</View>
		</View>
	)
}
