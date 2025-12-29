// import useVoucher from "@/hooks/voucher/useVoucher"
import {
	convertTo24Hour,
	customNotification,
	validateScheduleRideTime
} from "@/shared-utils"
import React, { useEffect } from "react"
import {
	AllInclusiveText,
	RideListAndCartContainer,
	RideListContainer,
	RideOptionsTitle
} from "./ride-list.style"
// import Discount from "@/components/order-page/components/discount"
import { Flex, Grid } from "@mantine/core"

import { map } from "lodash"
import RideOptionCard from "./components/RideOptionCard"

import { NoData } from "@/shared-components"
import { useRouter } from "next/router"
import RideChangeModal from "./components/RideChangeModal"
import RideSubHeader from "./components/RideSubHeader"
import { format } from "date-fns"
import useCarmelRideList from "@/hooks/rides/useCarmelRideList"
import { useMediaQuery } from "@mantine/hooks"
import useRideStore from "../store/useRideStore"
import PaymentFailedModal from "../ride-checkout/components/PaymentFailed"

const RideList = () => {
	const router = useRouter()
	const hotelId = router.query.hotelId
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const {
		// setRideVoucher,
		// setRideVoucherCode,
		rideOptions,
		ride,
		rideForm,
		refetchRideList,
		setRefetchRideList,
		setRideOptions,
		addRide,
		pickUpAddress,
		dropOffAddress,
		currentHotelDetails,
		setOpenChangeRideForm,
		setRideFormValue
	} = useRideStore()

	// const { mutate: fetchVoucher, isLoading: voucherLoading } = useVoucher({
	// 	onSuccess: (data: any) => {
	// 		if (Object.keys(data).length !== 0) {
	// 			setRideVoucher(data)
	// 		} else {
	// 			customNotification.error({
	// 				title: "Failure",
	// 				message: "Voucher not found!"
	// 			})
	// 			setRideVoucher(null)
	// 			setRideVoucherCode("")
	// 		}
	// 	}
	// })

	const { mutate: fetchPriceListFromCarmel } = useCarmelRideList({
		onSuccess: (result: any) => {
			if (result.fetchRidesSuccessful) {
				setRideOptions(result?.rideOptions)
				if (ride?.items !== null) {
					const selectedRide = rideOptions.filter(
						(rideOption: any) =>
							rideOption.carClassDesc.toLowerCase().trim() ===
							ride?.items?.name.toLowerCase().trim()
					)
					if (
						!validateScheduleRideTime(
							ride?.scheduledDate,
							currentHotelDetails?.timezone
						)
					) {
						customNotification.error({
							title: "Unable to book ride",
							message: "Please schedule the ride at least 15 minutes ahead"
						})
						setRideFormValue({
							...rideForm,
							travelDate: null,
							travelTime: ""
						})
						setOpenChangeRideForm(true)
						return
					}
					addRide({
						id: selectedRide[0]?.fare?.fareId,
						name: selectedRide[0]?.carClassDesc,
						cartItemId: selectedRide[0]?.fare?.fareId,
						cartItemTime: new Date(),
						imageUrl: `/carmel-cars/${selectedRide[0]?.carClassID}.png`,
						baseFare: selectedRide[0]?.fare?.fare,
						serviceFee:
							selectedRide[0]?.fare?.total - selectedRide[0]?.fare?.fare,
						price: selectedRide[0]?.fare?.total
					})
				}
				customNotification.success({
					message: "Prices are refreshed"
				})
			}
		},
		onError: () => {
			customNotification.error({
				title: "Failed",
				message: "Unable to find any rides"
			})
			router.push(`/${hotelId}`)
		}
	})

	useEffect(() => {
		if (refetchRideList) {
			const priceListPayload = {
				addressFrom: pickUpAddress,
				addressTo: dropOffAddress,
				tripDate:
					rideForm.travelDate && format(rideForm.travelDate, "MM/dd/yyyy"),
				tripTime: rideForm.travelTime && convertTo24Hour(rideForm.travelTime)
			}
			fetchPriceListFromCarmel({
				hotelId: currentHotelDetails?.webCode,
				rideList: priceListPayload
			})
			setRefetchRideList(false)
		}
	}, [refetchRideList])

	return (
		<RideListContainer>
			<RideSubHeader isRideListScreen={true} />
			<RideListAndCartContainer>
				{/* <Discount fetchVoucher={fetchVoucher} voucherLoading={voucherLoading} /> */}
				<Grid m={0} gutter={36}>
					<Grid.Col
						offsetXs={2}
						xs={10}
						offsetSm={2}
						sm={10}
						offsetMd={3}
						md={6}
						offsetLg={3}
						lg={6}
						offsetXl={3}
						xl={6}
					>
						<Flex direction='column'>
							<RideOptionsTitle>
								<b>Ride Options </b>
							</RideOptionsTitle>
							<AllInclusiveText>
								Service fee includes tax, toll, and tip.
							</AllInclusiveText>
							{rideOptions.length === 0 ? (
								<Flex sx={{ marginTop: "6rem" }}>
									<NoData
										message={`Sorry, we don't have any ride options available for this time. Please try again later.`}
									/>
								</Flex>
							) : (
								<Flex direction='column' rowGap={24} my={16}>
									<Grid>
										{map(rideOptions, rideOption => (
											<Grid.Col xs={12} xl={6} key={rideOption.carClassID}>
												<RideOptionCard
													id={rideOption.fare?.fareId}
													name={rideOption.carClassDesc}
													baseFare={rideOption.fare?.fare}
													price={rideOption.fare?.total}
													imageUrl={`/carmel-cars/${rideOption.carClassID}.png`}
													maxPassengers={rideOption.maxPassengers}
													maxLuggage={rideOption.maxLuggage}
													wheelChairAccessible={rideOption.maxWeelchairs > 0}
													carClassId={rideOption.carClassID}
													isSmallScreen={isSmallScreen}
												/>
											</Grid.Col>
										))}
									</Grid>
								</Flex>
							)}
						</Flex>
					</Grid.Col>
				</Grid>
			</RideListAndCartContainer>
			<RideChangeModal />
			<PaymentFailedModal />
		</RideListContainer>
	)
}

export default RideList
