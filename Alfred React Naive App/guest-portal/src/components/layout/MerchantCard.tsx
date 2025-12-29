/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { Merchant } from '@/src/types/merchant-types/merchants'
import { SchedulerClockIcon } from '../ui/icons/SchedulerClockIcon'
import { CustomChip } from '@components/ui/CustomChip'
import FallbackImage from '../ui/FallbackImage'

interface MerchantCardProperties {
	merchant: Merchant
	onPress: () => void
}

const MerchantCard = ({
	merchant,
	onPress
}: MerchantCardProperties): JSX.Element => {
	return (
		<TouchableOpacity
			onPress={onPress}
			className='bg-white mx-4 mb-6 rounded-xl overflow-hidden border border-gray-200'
		>
			{merchant.cover_image_url ? (
				<Image
					source={{ uri: merchant.cover_image_url }}
					className='aspect-[353/156]'
					resizeMode='stretch'
				/>
			) : (
				<FallbackImage aspectRatio={353 / 156} logoSize={80} textSize='large' />
			)}

			<View>
				<View className='flex-row justify-between pt-[12] pb-[8] px-[12]'>
					<Text
						variant='h2'
						className='font-medium text-[21px] text-blue-700 flex-1'
					>
						{merchant.name}
					</Text>
					<View className='flex-row items-start'>
						<CustomChip
							className='bg-blue-150 rounded-full py-[2] px-[8]'
							icon={
								<SchedulerClockIcon height='12' width='12' color='#052151' />
							}
						>
							<Text
								variant='p3'
								className='font-semibold text-blue-700 text-[11px]'
							>
								{` ${merchant.eta}mins`}
							</Text>
						</CustomChip>
					</View>
				</View>

				<Text variant='p3' className='text-gray-700 pb-[12] px-[12]'>
					{merchant.description}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default MerchantCard
