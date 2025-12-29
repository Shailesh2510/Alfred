import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { useRideStore } from '@/src/store/useRideStore'
import { TagIcon } from '@/src/components/ui/icons/TagIcon'
import CustomTextInputButtonField from '@/src/components/ui/CustomTextInputButtonField'
import { CloseIcon } from '@/src/components/ui/icons/CloseIcon'
import useAmbassadorCode from '@/src/hooks/useAmbassadorCode'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { useGlobalStore } from '@/src/store/useGlobalStore'

const RideDetails = () => {
	const [isExpanded, setIsExpanded] = useState(true)
	const [showAmbassadorInput, setShowAmbassadorInput] = useState(false)
	const { setSnackbarMessage } = useSnackbarStore()
	const { currentHotelDetails } = useGlobalStore()
	const webCode = currentHotelDetails?.webCode
	const {
		selectedRide,
		ambassadorCode,
		ambassadorDetails,
		setAmbassadorCode,
		setAmbassadorDetails,
		dropOffAddress
	} = useRideStore()

	const { mutate: fetchAmbassadorCode, isPending: isFetchingAmbassadorCode } =
		useAmbassadorCode({
			onSuccess: (response: any) => {
				const data = response?.data[0]
				if (data) {
					setAmbassadorDetails(data)
					setShowAmbassadorInput(false)
				} else {
					setSnackbarMessage(
						true,
						SnackbarType.ERROR,
						'Invalid Code',
						'Please enter a valid ambassador code'
					)
					setAmbassadorDetails(null)
					setAmbassadorCode('')
				}
			},
			onError: () => {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Error',
					'Failed to verify ambassador code'
				)
				setAmbassadorDetails(null)
				setAmbassadorCode('')
			}
		})

	if (!selectedRide) return null

	const handleApplyAmbassadorCode = () => {
		if (!ambassadorCode.trim()) {
			return
		}
		if (webCode) {
			fetchAmbassadorCode({
				ambassadorCode,
				code: ambassadorCode,
				airportCode: dropOffAddress.airportCode,
				webCode
			})
		}
	}
	const handleRemoveAmbassadorCode = () => {
		setAmbassadorDetails(null)
		setAmbassadorCode('')
		setShowAmbassadorInput(false)
	}

	const handleAddAmbassadorCode = () => {
		setAmbassadorDetails(null)
		setAmbassadorCode('')
		setShowAmbassadorInput(true)
	}

	return (
		<View>
			<Pressable
				onPress={() => setIsExpanded(!isExpanded)}
				className='flex-row justify-between items-center p-[12] bg-gray-300'
			>
				<Text variant='h5' className='font-bold text-blue-700'>
					{`Ride Details`}
				</Text>
				<Ionicons
					name={isExpanded ? 'chevron-up' : 'chevron-down'}
					size={20}
					color='#052151'
				/>
			</Pressable>
			<View className='border-t border-1 border-white' />
			{isExpanded && (
				<View className='bg-gray-250'>
					<View className='flex-row justify-between py-[16] px-[24]'>
						<Text variant='p2Medium' className='text-blue-700'>
							{selectedRide.name}
						</Text>
						<Text variant='p2Medium' className='text-blue-700'>
							${selectedRide.price.toFixed(2)}
						</Text>
					</View>
					<View className='border-t border-1 border-white w-[90%] self-center' />
					<View className='py-[16] px-[24]'>
						<Text variant='p2Heavy' className='font-bold text-blue-700'>
							{`Includes all taxes, fees, and tip for your convenience`}
						</Text>
					</View>

					{ambassadorDetails && ambassadorCode ? (
						<>
							<View className='border-t border-1 border-white w-[90%] self-center' />
							<View className='flex-row gap-[8] items-center py-[16] px-[24]'>
								<Text variant='p2Medium' className='text-utility-green500'>
									{ambassadorCode}
								</Text>
								<Pressable onPress={handleRemoveAmbassadorCode}>
									<CloseIcon color='#2454A4' />
								</Pressable>
							</View>
						</>
					) : null}

					<View className='border-t border-1 border-white w-[90%] self-center' />
					<View className='py-[16] px-[24]'>
						<View className='flex-row justify-between items-center'>
							<Text variant='h4' className='font-bold text-blue-700'>
								{`Total`}
							</Text>
							<Text variant='h4' className='font-bold text-blue-700'>
								${selectedRide.price.toFixed(2)}
							</Text>
						</View>
					</View>

					{showAmbassadorInput ? (
						<View className='px-[24] pb-[16]'>
							<CustomTextInputButtonField
								label='Ambassador Code'
								value={ambassadorCode}
								onChangeText={text => setAmbassadorCode(text)}
								buttonText={isFetchingAmbassadorCode ? 'Verifying...' : 'Apply'}
								onButtonPress={handleApplyAmbassadorCode}
								buttonDisabled={
									isFetchingAmbassadorCode || !ambassadorCode.trim()
								}
								isLoading={isFetchingAmbassadorCode}
							/>
						</View>
					) : (
						<Pressable
							onPress={handleAddAmbassadorCode}
							className='flex-row items-center justify-center gap-[8] pb-[16]'
						>
							<TagIcon color='#2454A4' />
							<Text variant='p2Heavy' className='font-bold text-blue-500'>
								{`Add ambassador code`}
							</Text>
						</Pressable>
					)}
				</View>
			)}
		</View>
	)
}

export default RideDetails
