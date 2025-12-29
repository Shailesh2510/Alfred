import useCarmelRideList from '@/src/hooks/useCarmelRideList'
import RideSelectionContainer from '@/src/screens/airportTransfer/RideSelectionContainer'
import { useRideStore } from '@/src/store/useRideStore'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { convertTo24Hour } from '@/src/utils/time-utils/convertTo24Hour'
import ScrollableContainer from '@components/ui/ScrollableContainer'
import { format } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, memo } from 'react'

const RideSelectionScreen = (): JSX.Element => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const timeValueReference = useRef(0)
	const {
		rideOptions,
		setResetTimer,
		setRefetchRideList,
		setTimeValue,
		timeValue,
		setRideOptions,
		selectedRide,
		addRide,
		refetchRideList,
		rideForm,
		pickUpAddress,
		dropOffAddress
	} = useRideStore()

	const { setSnackbarMessage } = useSnackbarStore()

	useEffect(() => {
		timeValueReference.current = timeValue
	}, [timeValue])

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		if (rideOptions.length > 0) {
			setTimeValue(rideOptions[0]?.fare?.expiresIn || 0)
			interval = setInterval(() => {
				if (timeValueReference.current > 0) {
					timeValueReference.current -= 1
					setTimeValue(timeValueReference.current)
				} else {
					clearInterval(interval!)
					setResetTimer(true)
					setRefetchRideList(true)
				}
			}, 1000)
		}

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [rideOptions])

	const { mutate: fetchPriceListFromCarmel } = useCarmelRideList({
		onSuccess: (result: any) => {
			if (result?.data?.length > 0) {
				setRideOptions(result?.data)
				if (selectedRide !== null) {
					const userSelectedRide = result?.data?.filter(
						(rideOption: any) =>
							rideOption.carClassDesc.toLowerCase().trim() ===
							selectedRide?.name.toLowerCase().trim()
					)
					addRide({
						id: userSelectedRide[0]?.fare?.fareId,
						name: userSelectedRide[0]?.carClassDesc,
						cartItemId: userSelectedRide[0]?.fare?.fareId,
						cartItemTime: new Date(),
						imageUrl: `/carmel-cars/${userSelectedRide[0]?.carClassID}.png`,
						baseFare: userSelectedRide[0]?.fare?.fare,
						serviceFee:
							userSelectedRide[0]?.fare?.total -
							userSelectedRide[0]?.fare?.fare,
						price: userSelectedRide[0]?.fare?.total,
						carClassId: userSelectedRide[0]?.carClassID
					})
				}
				setSnackbarMessage(
					true,
					SnackbarType.SUCCESS,
					'',
					'Prices are refreshed'
				)
			}
		},

		onError: () => {
			setRideOptions([])
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failure',
				'Unable to find any rides'
			)
			setTimeValue(0)
			router.push(`/${hotelId}/airport-transfer`)
		}
	})

	useEffect(() => {
		if (refetchRideList) {
			const priceListPayload = {
				addressFrom: pickUpAddress,
				addressTo: dropOffAddress,
				tripDate:
					rideForm.travelDate && format(rideForm.travelDate, 'MM/dd/yyyy'),
				tripTime: convertTo24Hour(rideForm.travelTime)
			}
			fetchPriceListFromCarmel({ hotelId: hotelId, rideList: priceListPayload })
			setRefetchRideList(false)
		}
	}, [refetchRideList])

	return (
		<ScrollableContainer>
			<RideSelectionContainer />
		</ScrollableContainer>
	)
}

export default memo(RideSelectionScreen)
