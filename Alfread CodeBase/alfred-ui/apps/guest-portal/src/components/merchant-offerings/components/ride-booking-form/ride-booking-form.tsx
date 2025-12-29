import {
	StyledButton,
	StyledDatePickerInput,
	StyledSelect
} from "@/design-components"
import { Grid, Flex, ActionIcon } from "@mantine/core"
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { BookRideText, RideBookingContainer } from "./ride-booking-form.style"
import { useForm } from "@mantine/form"
import { format, isBefore, startOfDay } from "date-fns"
import { isEmpty } from "lodash"
import {
	convertTo24Hour,
	customNotification,
	generateTimeOptionsInEST,
	validateScheduleRideTime
} from "@/shared-utils"
import useCarmelRideList from "@/hooks/rides/useCarmelRideList"
import useRideStore, {
	initialRideFormValues,
	RideFormValues
} from "../../store/useRideStore"
import useGlobalStore from "@/globalStore/globalStore"
import useGetMealPeriodIdByMerchantId from "@/hooks/hotel/useGetMealPeriodIdByMerchantId"
import { airportCoordinates } from "@/shared-constants"

const RideBookingForm = () => {
	const router = useRouter()
	const hotelId = router.query.hotelId
	const [timeOptions, setTimeOptions] = useState<string[]>([])
	const {
		setRideOptions,
		setRideScheduledDate,
		carmelMerchantId,
		setRideFormValue,
		rideForm,
		openChangeRideForm,
		setOpenChangeRideForm,
		removeRide,
		setTimeValue,
		setCarmelMealPeriodId,
		setRideScheduledTime,
		rideScheduledTime,
		setPickUpAddress,
		setDropOffAddress
	} = useRideStore()

	const form = useForm<RideFormValues>({
		initialValues: { ...initialRideFormValues },
		validate: values => ({
			airport: !values.airport && "Airport selection is required",
			travelDate: !values.travelDate && "Travel date is required",
			travelTime: !rideScheduledTime && "Travel Time is required"
		})
	})

	const { currentHotelDetails } = useGlobalStore()

	const { mutate: fetchCarmelMealPeriodId } = useGetMealPeriodIdByMerchantId({
		onSuccess: (result: any) => {
			setCarmelMealPeriodId(result[0])
		},
		onError: () => {
			console.log("Failed to fetch Meal Period Id")
		}
	})

	const { mutate: fetchPriceListFromCarmel, isLoading: fetchingPriceList } =
		useCarmelRideList({
			onSuccess: (result: any) => {
				if (result.fetchRidesSuccessful) {
					setRideOptions(result?.rideOptions)
					setOpenChangeRideForm(false)
					fetchCarmelMealPeriodId(carmelMerchantId)
					setTimeValue(result?.rideOptions[0]?.fare?.expiresIn || 0)
					router.push(`/${hotelId}/rides/${carmelMerchantId}`)
				} else {
					customNotification.error({
						title: "Failed",
						message: "Unable to find any rides"
					})
				}
			},
			onError: () => {
				customNotification.error({
					title: "Failed",
					message: "Unable to find any rides"
				})
			}
		})

	const handleRideTime = (
		selectedDate: Date | null,
		selectedTimeStr: string
	) => {
		if (selectedDate && selectedTimeStr) {
			const zonedDate = new Date(
				format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX")
			)
			const [timeStr, period] = selectedTimeStr.split(" ")
			const [hourStr, minuteStr] = timeStr.split(":")
			let hour = parseInt(hourStr)
			const minute = parseInt(minuteStr)

			if (period === "PM" && hour !== 12) {
				hour += 12
			}
			if (period === "AM" && hour === 12) {
				hour = 0
			}

			const dateWithTime = new Date(zonedDate)
			dateWithTime.setHours(hour, minute, 0)

			const formattedDate = format(dateWithTime, "MM/dd/yyyy hh:mm a")
			return `${formattedDate} EST`
		}
		return null
	}

	useEffect(() => {
		if (form.values.travelDate) {
			setTimeOptions(
				generateTimeOptionsInEST(
					form.values.travelDate,
					currentHotelDetails?.timezone
				)
			)
		}
	}, [form.values.travelDate])

	useEffect(() => {
		if (rideForm) {
			form.setValues({
				airport: rideForm.airport,
				travelDate: rideForm.travelDate,
				travelTime: rideForm.travelTime
			})
		}
	}, [rideForm])

	const handleFindRideSubmit = (rideScheduledDate: string | null) => {
		setRideScheduledDate(rideScheduledDate)
		setRideFormValue({ ...form.values, travelTime: rideScheduledTime })

		const pickUpAddress = {
			streetName: currentHotelDetails?.addressStreet,
			cityName: currentHotelDetails?.cityName,
			streetNumber: currentHotelDetails?.addressNumber,
			latitude: currentHotelDetails?.coordinates.x,
			longitude: currentHotelDetails?.coordinates.y,
			airport: false
		}

		const dropOffAddress = {
			airport: true,
			airportCode: form.values.airport,
			latitude: airportCoordinates[form.values.airport]?.latitude || 0,
			longitude: airportCoordinates[form.values.airport]?.longitude || 0
		}
		const priceListPayload = {
			addressFrom: pickUpAddress,
			addressTo: dropOffAddress,
			tripDate:
				form.values.travelDate && format(form.values.travelDate, "MM/dd/yyyy"),
			tripTime: convertTo24Hour(rideScheduledTime)
		}

		setPickUpAddress(pickUpAddress)
		setDropOffAddress(dropOffAddress)

		fetchPriceListFromCarmel({ hotelId: hotelId, rideList: priceListPayload })
	}

	return (
		<RideBookingContainer>
			<Grid gutter={24} justify='center' align='center'>
				<Grid.Col
					xs={12}
					sm={8}
					md={6}
					lg={openChangeRideForm ? 10 : 4}
					xl={openChangeRideForm ? 10 : 3}
				>
					{!openChangeRideForm ? (
						<Flex align='flex-start' mb={12} justify='space-between'>
							<ActionIcon
								onClick={() => {
									router.back()
								}}
								variant='transparent'
							>
								<IconArrowLeft />
							</ActionIcon>
							<BookRideText>Book Ride</BookRideText>
						</Flex>
					) : null}
					<Flex direction={"column"}>
						<StyledSelect
							label='Airport'
							placeholder='Select airport'
							required
							data={[
								{
									value: "JFK",
									label: "John F. Kennedy International Airport (JFK)"
								},
								{ value: "LGA", label: "LaGuardia Airport (LGA)" },
								{
									value: "EWR",
									label: "Newark Liberty International Airport (EWR)"
								}
							]}
							{...form.getInputProps("airport")}
						/>

						<StyledDatePickerInput
							label='Travel Date'
							placeholder='Pick travel date'
							clearable={true}
							inputFormat='MM/DD/YYYY'
							excludeDate={(date: any) =>
								isBefore(date, startOfDay(new Date()))
							}
							icon={<IconCalendar size={16} />}
							{...form.getInputProps("travelDate")}
						/>

						<StyledSelect
							label='Travel Time'
							placeholder='Select time'
							required
							data={timeOptions.map(time => ({ value: time, label: time }))}
							value={rideScheduledTime}
							onChange={(value: any) => setRideScheduledTime(value || "")}
							disabled={!form.values.travelDate}
						/>
					</Flex>
					<Flex>
						<StyledButton
							fullWidth={true}
							mt={24}
							mb={24}
							size='md'
							radius={8}
							color='indigo.9'
							loading={fetchingPriceList}
							disabled={!form.isValid()}
							onClick={() => {
								form.validate().errors
								removeRide()
								if (isEmpty(form.validate().errors)) {
									const rideScheduledDate = handleRideTime(
										form.values?.travelDate,
										rideScheduledTime
									)
									if (
										!validateScheduleRideTime(
											rideScheduledDate,
											currentHotelDetails?.timezone
										)
									) {
										customNotification.error({
											title: "Unable to book ride",
											message:
												"Please schedule the ride at least 15 minutes ahead"
										})
										form.setFieldValue("travelDate", rideForm.travelDate)
										form.setFieldValue("travelTime", rideForm.travelTime)
										setRideScheduledTime(rideForm.travelTime)
									} else {
										handleFindRideSubmit(rideScheduledDate)
									}
								}
							}}
						>
							Find Rides
						</StyledButton>
					</Flex>
				</Grid.Col>
			</Grid>
		</RideBookingContainer>
	)
}

export default RideBookingForm
