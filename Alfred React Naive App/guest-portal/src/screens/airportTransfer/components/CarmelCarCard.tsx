import { View, Image, Pressable } from 'react-native'
import React from 'react'
import { Text } from '@components/ui/text'
import { PersonIcon } from '@components/ui/icons/PersonIcon'
import { SuitcaseIcon } from '@components/ui/icons/SuitcaseIcon'
import { RideOption } from '@/src/types/ride-types'
import { useRideStore } from '@/src/store/useRideStore'
import * as LXCarImage from '@/assets/images/carmel-cars/LX.png'
import * as SDCarImage from '@/assets/images/carmel-cars/SD.png'
import * as SVCarImage from '@/assets/images/carmel-cars/SV.png'
import * as VNCarImage from '@/assets/images/carmel-cars/VN.png'
import * as WVCarImage from '@/assets/images/carmel-cars/WV.png'
const carImages = {
	LX: LXCarImage,
	SD: SDCarImage,
	SV: SVCarImage,
	VN: VNCarImage,
	WV: WVCarImage
}

interface CarmelCarCardProperties {
	rideOption: RideOption
	isSelected: boolean
	onSelectRide: (rideId: string) => void
}

const CarmelCarCard = ({
	rideOption,
	isSelected,
	onSelectRide
}: CarmelCarCardProperties): JSX.Element => {
	const { addRide } = useRideStore()

	const handleRideSelection = () => {
		onSelectRide(rideOption.fare.fareId)
		addRide({
			id: rideOption?.fare?.fareId,
			name: rideOption?.carClassDesc,
			cartItemId: rideOption?.fare?.fareId,
			cartItemTime: new Date(),
			baseFare: rideOption?.fare?.fare,
			serviceFee: rideOption?.fare?.total - rideOption?.fare?.fare,
			price: rideOption?.fare?.total,
			carClassId: rideOption?.carClassID
		})
	}

	return (
		<Pressable onPress={handleRideSelection} style={{ cursor: 'pointer' }}>
			<View
				className={`mx-[16] mt-[16] rounded-lg overflow-hidden border-[2px] ${
					isSelected
						? 'border-blue-500 bg-blue-350'
						: 'border-gray-200 bg-white'
				}`}
			>
				<View className='flex-row items-center justify-center'>
					<View className='w-[180] h-[120] bg-white '>
						<Image
							source={
								carImages[rideOption.carClassID as keyof typeof carImages]
							}
							style={{ width: '100%', height: '100%' }}
							resizeMode='contain'
						/>
					</View>
					<View className='flex-1 py-[8] pl-[24]'>
						<Text
							variant='h2'
							className='text-blue-700 pb-[11] text-[21px] font-[400]'
						>
							{rideOption.carClassDesc}
						</Text>
						<View className='flex-row items-center pb-[11]'>
							<View className='gap-[4]'>
								<View className='flex-row items-center gap-[2]'>
									<PersonIcon />
									<Text variant='p2Roman' className='text-gray-700 mt-[4]'>
										{rideOption.maxPassengers}
										{` People`}
									</Text>
								</View>
								<View className='flex-row items-center gap-[2]'>
									<SuitcaseIcon />
									<Text variant='p2Roman' className='text-gray-700 mt-[4]'>
										{rideOption.maxLuggage}
										{` Bags`}
									</Text>
								</View>
							</View>
						</View>
						<Text variant='p2Heavy' className='text-blue-700 font-[800]'>
							${rideOption.fare.total.toFixed(2)}
						</Text>
					</View>
				</View>
			</View>
		</Pressable>
	)
}

export default CarmelCarCard
