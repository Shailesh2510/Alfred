import { PageStructure } from "@/shared-components"
import {
	StyledDivider,
	StyledTextInput,
	StyledButton,
	StyledSelect,
	StyledNumberInput,
	StyledCheckbox,
	StyledTextarea
} from "@/design-components"
import { Flex, Grid, Loader } from "@mantine/core"
import { useForm } from "@mantine/form"
import {
	AddEditHotelContainer,
	AddEditHotelBody,
	AddEditHotelFooter
} from "./hotel-add-edit.style"
import { useRouter } from "next/router"
import { isBoolean, isEmpty, map, orderBy, toString } from "lodash"
import useHotel from "@/hooks/hotel/useHotel"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { customNotification } from "@/shared-utils"
import useEditHotel from "@/hooks/hotel/useEditHotel"
import useAddHotel from "@/hooks/hotel/useAddHotel"
import useCities from "@/hooks/city/useCities"
import {
	EMAIL_VALIDATION_REGEX,
	PHONE_VALIDATION_REGEX
} from "@/shared-constants"

const AddEditHotel = () => {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { hotelId } = router.query

	const isEdit = router.pathname.includes("edit")

	const { data: hotel, isLoading: hotelLoading } = useHotel(
		{ hotelId: hotelId as string },
		{
			enabled: !!hotelId
		}
	)

	const { data: cities } = useCities()

	const currentHotel = hotel?.data?.[0]

	useEffect(() => {
		if (currentHotel) {
			form.setValues({
				name: currentHotel?.name,
				addressNumber: currentHotel?.addressNumber,
				addressStreet: currentHotel?.addressStreet,
				addressTown: currentHotel?.addressTown,
				addressZipCode: currentHotel?.addressZipCode,
				contactName: currentHotel?.contactName,
				contactEmail: currentHotel?.contactEmail,
				contactPhone: currentHotel?.contactPhone,
				webCode: currentHotel?.webCode,
				billingEmail: currentHotel?.billingEmail,
				allowCreditCard: currentHotel?.allowCreditCard,
				allowRoomCharge: currentHotel?.allowRoomCharge,
				isTaxExempt: currentHotel?.isTaxExempt,
				rooms: currentHotel?.rooms?.join(","),
				latitude: currentHotel?.coordinates?.x,
				longitude: currentHotel?.coordinates?.y,
				isActive: currentHotel?.isActive,
				hasCutlery: currentHotel?.hasCutlery,
				hasDeliveryFee: currentHotel?.hasDeliveryFee,
				hasThirdPartyDelivery: currentHotel?.hasThirdPartyDelivery,
				deliveryInstructions: currentHotel?.deliveryInstructions,
				isWebEnabled: currentHotel?.isWebEnabled,
				cityId: currentHotel?.cityId,
				enableAutomaticTip: currentHotel?.enableAutomaticTip
			})
		}
	}, [currentHotel])

	const { mutate: editHotel } = useEditHotel({
		onSuccess: () => {
			customNotification.success({
				title: "Hotel edit",
				message: "Hotel edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Hotel edit",
				message: "Hotel edit failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["hotel"])
			queryClient.invalidateQueries(["hotels"])
			router.push("/hotels")
		}
	})

	const { mutate: addHotel } = useAddHotel({
		onSuccess: () => {
			customNotification.success({
				title: "Hotel add",
				message: "Hotel added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Hotel add",
				message: "Hotel addition failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["hotel"])
			queryClient.invalidateQueries(["hotels"])
			router.push("/hotels")
		}
	})

	const form: any = useForm({
		validateInputOnChange: true,
		initialValues: {
			name: "",
			addressNumber: "",
			addressStreet: "",
			addressTown: "",
			addressZipCode: "",
			contactName: "",
			contactEmail: "",
			contactPhone: "",
			billingEmail: "",
			webCode: "",
			allowCreditCard: true,
			allowRoomCharge: true,
			isTaxExempt: false,
			enableAutomaticTip: false,
			rooms: "",
			latitude: "",
			longitude: "",
			isActive: true,
			hasCutlery: true,
			hasDeliveryFee: true,
			hasThirdPartyDelivery: true,
			deliveryInstructions: "",
			isWebEnabled: true,
			cityId: null
		},
		validate: {
			name: (value: string) =>
				value?.length < 2 ? "Hotel name is required" : null,
			addressNumber: (value: string) =>
				value?.length < 1 ? "Hotel address number is required" : null,
			addressStreet: (value: string) =>
				value?.length < 2 ? "Hotel address street is required" : null,
			addressTown: (value: string) =>
				value?.length < 2 ? "Hotel address town is required" : null,
			addressZipCode: (value: string) =>
				value?.length < 2 ? "Hotel address zip code is required" : null,
			contactName: (value: string) =>
				value?.length < 2 ? "Hotel contact name is required" : null,
			contactEmail: (value: string) =>
				!EMAIL_VALIDATION_REGEX.test(value)
					? "Please enter a valid email"
					: null,
			contactPhone: (value: string) =>
				!PHONE_VALIDATION_REGEX.test(value)
					? "Please enter a valida phone number"
					: null,
			webCode: (value: string) =>
				value?.length < 3 ? "Hotel web code is required" : null,
			billingEmail: (value: string) =>
				form.values.allowRoomCharge
					? !EMAIL_VALIDATION_REGEX.test(value)
						? "Please enter a valid email"
						: null
					: null,
			allowCreditCard: (value: boolean) =>
				!isBoolean(value) ? "Allowed credit card field is requried" : null,
			allowRoomCharge: (value: boolean) =>
				!isBoolean(value) ? "Allowed room charge field is requried" : null,
			isTaxExempt: (value: boolean) =>
				!isBoolean(value) ? "Is TAX exempt field is requried" : null,
			rooms: (value: string) =>
				value?.length < 1 ? "Hotel rooms field is required" : null,
			latitude: (value: string) =>
				value?.length < 1 ? "Hotel latitude is required" : null,
			longitude: (value: string) =>
				value?.length < 1 ? "Hotel longitude is required" : null,
			isActive: (value: boolean) =>
				!isBoolean(value) ? "Is active field is requried" : null,
			enableAutomaticTip: (value: boolean) =>
				!isBoolean(value) ? "Is Mandatory Tip field is requried" : null,
			hasCutlery: (value: boolean) =>
				!isBoolean(value) ? "⁠Has cutlery field is requried" : null,
			hasDeliveryFee: (value: boolean) =>
				!isBoolean(value) ? "⁠Has delivery fee field is requried" : null,
			hasThirdPartyDelivery: (value: boolean) =>
				!isBoolean(value)
					? "⁠Has third party delivery field is requried"
					: null,
			deliveryInstructions: (value: string) =>
				value?.length < 6 ? "Delivery instructions are required" : null,
			isWebEnabled: (value: boolean) =>
				!isBoolean(value) ? "Is web enabled field is requried" : null,
			cityId: (value: string) => (!value ? "Hotel city is requried" : null)
		},
		transformValues: values => ({
			name: values.name,
			addressNumber: toString(values.addressNumber),
			addressStreet: values.addressStreet,
			addressTown: values.addressTown,
			addressZipCode: values.addressZipCode,
			contactName: values.contactName,
			contactEmail: values.contactEmail,
			contactPhone: values.contactPhone,
			webCode: values.webCode,
			billingEmail: values.billingEmail ? values.billingEmail : " ",
			allowCreditCard: values.allowCreditCard,
			allowRoomCharge: values.allowRoomCharge,
			isTaxExempt: values.isTaxExempt,
			rooms: values?.rooms?.split(","),
			isActive: values.isActive,
			hasCutlery: values.hasCutlery,
			hasDeliveryFee: values.hasDeliveryFee,
			hasThirdPartyDelivery: values.hasThirdPartyDelivery,
			deliveryInstructions: values.deliveryInstructions,
			isWebEnabled: values.isWebEnabled,
			coordinates:
				values.longitude && values.latitude
					? `(${values.latitude},${values.longitude})`
					: "",
			cityId: values.cityId,
			enableAutomaticTip: values.enableAutomaticTip
		})
	})

	const cityOptions = orderBy(
		map(cities?.data, city => ({
			value: city?.id,
			label: city?.name
		})),
		"label"
	)

	return (
		<PageStructure
			title={isEdit ? "Edit Hotel" : "Add Hotel"}
			goBack={true}
			pageContent={
				<>
					{isEdit && hotelLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<AddEditHotelContainer>
							<AddEditHotelBody>
								<Grid gutter={40} h='100%'>
									<Grid.Col md={4}>
										<Flex direction='column' gap={16}>
											<StyledDivider
												p={0}
												m={0}
												size='xs'
												color='gray.6'
												labelPosition='center'
												label='OVERVIEW'
											/>
											<StyledTextInput
												label='Name'
												placeholder='Name'
												required
												{...form.getInputProps("name")}
											/>
											<StyledTextInput
												label='Web code'
												placeholder='Web code'
												required
												{...form.getInputProps("webCode")}
											/>
											<StyledDivider
												p={0}
												m={0}
												size='xs'
												color='gray.6'
												labelPosition='center'
												label='CONTACT'
											/>
											<StyledTextInput
												label='Contact name'
												placeholder='Contact name'
												required
												{...form.getInputProps("contactName")}
											/>
											<StyledTextInput
												label='Contact email'
												placeholder='Contact email'
												required
												{...form.getInputProps("contactEmail")}
											/>
											<StyledTextInput
												label='Contact phone'
												placeholder='Contact phone'
												required
												{...form.getInputProps("contactPhone")}
											/>
										</Flex>
									</Grid.Col>
									<Grid.Col md={4}>
										<Flex direction='column' gap={16}>
											<StyledDivider
												color='gray.6'
												size='xs'
												labelPosition='center'
												label='ADDRESS'
												p={0}
												m={0}
											/>
											<StyledTextInput
												label='Number'
												placeholder='Number'
												required
												{...form.getInputProps("addressNumber")}
											/>
											<StyledTextInput
												label='Street'
												placeholder='Street'
												required
												{...form.getInputProps("addressStreet")}
											/>
											<StyledTextInput
												label='Town'
												placeholder='Town'
												required
												{...form.getInputProps("addressTown")}
											/>
											<StyledTextInput
												label='Zip code'
												placeholder='Zip code'
												required
												{...form.getInputProps("addressZipCode")}
											/>
											<StyledSelect
												label='City'
												placeholder='City'
												required
												data={cityOptions}
												{...form.getInputProps("cityId")}
											/>
										</Flex>
									</Grid.Col>
									<Grid.Col md={4}>
										<Flex direction='column' gap={16}>
											<StyledDivider
												p={0}
												m={0}
												size='xs'
												color='gray.6'
												labelPosition='center'
												label='CONFIGURATION'
											/>
											<StyledCheckbox
												label='Is active'
												placeholder='Is active'
												{...form.getInputProps("isActive", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Mandatory Tip'
												placeholder='Mandatory Tip'
												{...form.getInputProps("enableAutomaticTip", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Has third party delivery'
												placeholder='Has third party delivery'
												{...form.getInputProps("hasThirdPartyDelivery", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Has delivery fee'
												placeholder='Has delivery fee'
												{...form.getInputProps("hasDeliveryFee", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Has cutlery'
												placeholder='Has cutlery'
												{...form.getInputProps("hasCutlery", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Allow credit cards'
												placeholder='Allow credit cards'
												{...form.getInputProps("allowCreditCard", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Allow room charge'
												placeholder='Allow room charge'
												{...form.getInputProps("allowRoomCharge", {
													type: "checkbox"
												})}
											/>
											{form.values?.allowRoomCharge && (
												<StyledTextInput
													label='Billing email email'
													placeholder='Billing email'
													required
													{...form.getInputProps("billingEmail")}
												/>
											)}
											<StyledCheckbox
												label='Is TAX exempt'
												placeholder='Is TAX exempt'
												{...form.getInputProps("isTaxExempt", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Is web enabled'
												placeholder='Is web enabled'
												{...form.getInputProps("isWebEnabled", {
													type: "checkbox"
												})}
											/>
											<Flex columnGap={16}>
												<StyledNumberInput
													label='Latitude'
													placeholder='Latitude'
													required
													precision={4}
													{...form.getInputProps("latitude")}
												/>
												<StyledNumberInput
													label='Longitude'
													placeholder='Longitude'
													required
													precision={4}
													{...form.getInputProps("longitude")}
												/>
											</Flex>
											<StyledTextInput
												label='Delivery instructions'
												placeholder='Delivery instructions'
												required
												{...form.getInputProps("deliveryInstructions")}
											/>
											<StyledTextarea
												label='Rooms (comma separated)'
												creatable
												searchable
												required
												size='lg'
												minRows={6}
												placeholder='Rooms'
												{...form.getInputProps("rooms")}
											/>
										</Flex>
									</Grid.Col>
								</Grid>
							</AddEditHotelBody>
						</AddEditHotelContainer>
					)}
				</>
			}
			footerContent={
				<AddEditHotelFooter>
					<StyledButton
						mr={16}
						variant='outline'
						color='dark'
						onClick={() => router.push(`/hotels`)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						onClick={() => {
							if (isEmpty(form.validate().errors)) {
								isEdit
									? editHotel({
											hotelId,
											...form.getTransformedValues(form.values)
									  })
									: addHotel(form.getTransformedValues(form.values))
							}
						}}
					>
						{isEdit ? "Save changes" : "Add hotel"}
					</StyledButton>
				</AddEditHotelFooter>
			}
		/>
	)
}

export default AddEditHotel
