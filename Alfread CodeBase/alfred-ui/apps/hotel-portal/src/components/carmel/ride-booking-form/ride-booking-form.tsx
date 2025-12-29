import {
	StyledButton,
	StyledDatePickerInput,
	StyledSelect,
	StyledTextInput
} from "@/design-components"
import { Grid, Flex, ActionIcon, SegmentedControl } from "@mantine/core"
import {
	IconArrowLeft,
	IconArrowNarrowRight,
	IconCalendar
} from "@tabler/icons-react"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import {
	BookRideText,
	NoCarmelAssociationText,
	RideBookingContainer,
	RideTypeOptionsContainer
} from "./ride-booking-form.style"
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
} from "../store/useRideStore"
import {
	ADDRESS_LABEL,
	airportCoordinates,
	LOCATION_LABEL,
	MERCHANT_TYPE_RIDES
} from "@/shared-constants"
import { FlexLoader } from "@/shared-components"
import useMerchants from "@/hooks/merchant/useMerchants"

const RideBookingForm = () => {
	const router = useRouter()
	const { data: merchants, isLoading: merchantsLoading } = useMerchants()
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
		setRideScheduledTime,
		rideScheduledTime,
		currentHotelDetails,
		setPickUpAddress,
		setDropOffAddress,
		rideType,
		setRideType,
		setCarmelMerchantId,
		setCarmelMealPeriodId,
		setSelectedAirportCode
	} = useRideStore()

	const form = useForm<RideFormValues>({
		initialValues: { ...initialRideFormValues },
		validate: values => ({
			airport: !values.airport ? "Airport selection is required" : null,
			travelDate: !values.travelDate ? "Travel date is required" : null,
			travelTime: !rideScheduledTime ? "Travel Time is required" : null,
			flightNumber:
				values.flightNumber?.length < 2 && rideType === "PICKUP"
					? "Please enter a valid flight number"
					: null
		})
	})

	const { mutate: fetchPriceListFromCarmel, isLoading: fetchingPriceList } =
		useCarmelRideList({
			onSuccess: (result: any) => {
				if (result.fetchRidesSuccessful) {
					setRideOptions(result?.rideOptions)
					setOpenChangeRideForm(false)
					setTimeValue(result?.rideOptions[0]?.fare?.expiresIn || 0)
					router.push(`/rides/${carmelMerchantId}`)
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
			return `${formattedDate}`
		}
		return null
	}

	useEffect(() => {
		if (
			carmelMerchantId === 0 &&
			merchants &&
			merchants?.data?.length > 0 &&
			!merchantsLoading
		) {
			const isCarmelMerchantAssociated = merchants?.data?.filter(
				(merchant: any) => {
					return merchant.merchantType === MERCHANT_TYPE_RIDES
				}
			)
			if (isCarmelMerchantAssociated.length > 0) {
				setCarmelMerchantId(isCarmelMerchantAssociated[0].id)
				setCarmelMealPeriodId(isCarmelMerchantAssociated[0].carmelMealPeriodId)
			}
		}
	}, [merchants, merchantsLoading])

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
				travelTime: rideForm.travelTime,
				flightNumber: rideForm.flightNumber
			})
		}
	}, [rideForm])

	const handleFindRideSubmit = (rideScheduledDate: string | null) => {
		setRideScheduledDate(rideScheduledDate)
		setRideFormValue({ ...form.values, travelTime: rideScheduledTime })
		setSelectedAirportCode(form.values.airport)
		const pickUpAddress = {
			streetName: currentHotelDetails?.addressStreet,
			cityName: currentHotelDetails?.addressTown,
			streetNumber: currentHotelDetails?.addressNumber,
			latitude: currentHotelDetails?.coordinates.x,
			longitude: currentHotelDetails?.coordinates.y,
			airport: false,
			flightNumber: form.values.flightNumber
		}

		const dropOffAddress = {
			airport: true,
			airportCode: form.values.airport,
			latitude: airportCoordinates[form.values.airport]?.latitude || 0,
			longitude: airportCoordinates[form.values.airport]?.longitude || 0,
			flightNumber: form.values.flightNumber
		}
		const priceListPayload = {
			addressFrom: rideType === "PICKUP" ? dropOffAddress : pickUpAddress,
			addressTo: rideType === "PICKUP" ? pickUpAddress : dropOffAddress,
			tripDate:
				form.values.travelDate && format(form.values.travelDate, "MM/dd/yyyy"),
			tripTime: convertTo24Hour(rideScheduledTime)
		}

		setPickUpAddress(rideType === "PICKUP" ? dropOffAddress : pickUpAddress)
		setDropOffAddress(rideType === "PICKUP" ? pickUpAddress : dropOffAddress)

		fetchPriceListFromCarmel({
			hotelId: currentHotelDetails?.webCode,
			rideList: priceListPayload
		})
	}

	const rideTypeOptions = [
		{
			label: (
				<RideTypeOptionsContainer>
					Hotel <IconArrowNarrowRight size={16} /> Airport
				</RideTypeOptionsContainer>
			),
			value: "DROPOFF"
		},
		{
			label: (
				<RideTypeOptionsContainer>
					Airport <IconArrowNarrowRight size={16} /> Hotel
				</RideTypeOptionsContainer>
			),
			value: "PICKUP"
		}
	]

	if (merchantsLoading) {
		return <FlexLoader />
	}

	if (carmelMerchantId === 0) {
		return (
			<Flex justify='center' align='center' h={`100vh`}>
				<NoCarmelAssociationText>{`Please associate your hotel with Carmel before booking a ride!`}</NoCarmelAssociationText>
			</Flex>
		)
	}

	return (
		<RideBookingContainer isRideCartModalOpen={openChangeRideForm}>
			<Grid justify='center' align='center' sx={{ padding: "0px !important" }}>
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
					<SegmentedControl
						radius={4}
						fullWidth
						mt={12}
						mb={12}
						data={rideTypeOptions}
						value={rideType}
						onChange={value => {
							setRideType(value)
						}}
					/>
					<Flex direction={"column"}>
						<StyledSelect
							label={
								rideType === "PICKUP"
									? ADDRESS_LABEL.DROP_OFF_ADDRESS.label
									: ADDRESS_LABEL.PICK_UP_ADDRESS.label
							}
							disabled={true}
							value={currentHotelDetails?.name}
							data={[
								{
									value: currentHotelDetails?.name,
									label: currentHotelDetails?.name
								}
							]}
						/>
						<StyledSelect
							label={
								rideType === "PICKUP"
									? LOCATION_LABEL.PICK_UP_LOCATION.label
									: LOCATION_LABEL.DROP_OFF_LOCATION.label
							}
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
							required
							value={form.values.travelDate}
							inputFormat='MM/DD/YYYY'
							excludeDate={(date: any) =>
								isBefore(date, startOfDay(new Date()))
							}
							icon={<IconCalendar size={16} />}
							onChange={(value: any) => {
								form.setFieldValue("travelDate", value)
								setRideScheduledTime("")
							}}
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
						{rideType === "PICKUP" ? (
							<StyledTextInput
								label='Flight number'
								required
								mb={12}
								{...form.getInputProps("flightNumber")}
							/>
						) : null}
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
