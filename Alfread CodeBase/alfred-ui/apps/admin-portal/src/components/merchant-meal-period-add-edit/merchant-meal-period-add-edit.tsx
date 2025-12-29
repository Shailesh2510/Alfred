import { PageStructure } from "@/shared-components"
import {
	StyledTextInput,
	StyledTimeInput,
	StyledButton
} from "@/design-components"
import { ActionIcon, Flex, Grid, Loader } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useEffect, useRef } from "react"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { customNotification } from "@/shared-utils"
import { useQueryClient } from "@tanstack/react-query"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import {
	AddEditMealPeriodContainer,
	AddEditMealPeriodFooter
} from "./merchant-meal-period-add-edit.style"
import useMerchant from "@/hooks/merchant/useMerchant"
import useEditMerchantMealPeriod from "@/hooks/meal-period/useEditMerchantMealPeriod"
import useAddMerchantMealPeriod from "@/hooks/meal-period/useAddMerchantMealPeriod"
import useMerchantMealPeriod from "@/hooks/meal-period/useMerchantMealPeriod"
import { IconClock } from "@tabler/icons-react"
import { ICON_SIZE } from "@/shared-constants"

const AddEditMealPeriod = () => {
	const startHourRef: any = useRef()
	const endHourRef: any = useRef()

	const router = useRouter()
	const queryClient = useQueryClient()
	const merchantId = router.query.id
	const mealPeriodId = router.query.mealPeriodId

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const { data: merchantMealPeriod, isLoading: merchantMealPeriodLoading } =
		useMerchantMealPeriod(
			{ merchantId, mealPeriodId },
			{
				enabled: !!merchantId && !!mealPeriodId
			}
		)

	const isEdit = router.pathname.includes("edit")

	const currentMerchant = merchant?.data?.[0]
	const currentMealPeriod = merchantMealPeriod?.data?.[0]

	useEffect(() => {
		if (currentMealPeriod) {
			form.setValues({
				name: currentMealPeriod?.name,
				startHour: currentMealPeriod?.startHour,
				endHour: currentMealPeriod?.endHour
			})
		}
	}, [currentMealPeriod])

	const { mutate: editMerchantMealPeriod } = useEditMerchantMealPeriod({
		onSuccess: () => {
			customNotification.success({
				title: "Meal period edit",
				message: "Meal period edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Meal period edit",
				message: "Meal period edit failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["merchant_meal_period"])
			queryClient.invalidateQueries(["merchant_meal_periods"])
			queryClient.invalidateQueries(["hotel"])
			queryClient.invalidateQueries(["merchants"])
			router.push(`/merchants/${merchantId}/meal-periods`)
		}
	})

	const { mutate: addMerchantMealPeriod } = useAddMerchantMealPeriod({
		onSuccess: () => {
			customNotification.success({
				title: "Add meal period",
				message: "Meal period added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Add meal period",
				message: "Meal period addition failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["merchant_meal_period"])
			queryClient.invalidateQueries(["merchant_meal_periods"])
			queryClient.invalidateQueries(["hotel"])
			router.push(`/merchants/${merchantId}/meal-periods`)
		}
	})

	const form = useForm({
		initialValues: {
			name: "",
			startHour: "",
			endHour: ""
		},
		validate: values => ({
			name: !values.name && "Meal period name is required",
			startHour: !values.startHour && "Meal period start hour is required",
			endHour: !values.endHour && "Meal period end hour is required"
		}),
		transformValues: values => {
			return {
				name: values.name ? values.name : "",
				startHour: values.startHour ? values.startHour : "",
				endHour: values.endHour ? values.endHour : ""
			}
		}
	})

	return (
		<PageStructure
			title={
				currentMerchant?.name
					? `${currentMerchant?.name} - ${
							isEdit ? "Edit meal period" : "Add meal period"
					  }`
					: null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			goBack={true}
			pageContent={
				isEdit && (merchantLoading || merchantMealPeriodLoading) ? (
					<Flex mih={600} w='100%' justify='center' align='center'>
						<Loader />
					</Flex>
				) : (
					<AddEditMealPeriodContainer>
						<Grid gutter={40} h='100%'>
							<Grid.Col md={4}>
								<Flex direction='column' gap={16}>
									<StyledTextInput
										required
										label='Meal period name'
										placeholder='Meal period name'
										{...form.getInputProps("name")}
									/>
									<StyledTimeInput
										required
										label='Start hour'
										ref={startHourRef}
										{...form.getInputProps("startHour")}
										rightSection={
											<ActionIcon
												onClick={() => startHourRef?.current?.showPicker()}
											>
												<IconClock size={ICON_SIZE} stroke={1.5} />
											</ActionIcon>
										}
									/>
									<StyledTimeInput
										required
										label='End hour'
										ref={endHourRef}
										{...form.getInputProps("endHour")}
										rightSection={
											<ActionIcon
												onClick={() => endHourRef?.current?.showPicker()}
											>
												<IconClock size={ICON_SIZE} stroke={1.5} />
											</ActionIcon>
										}
									/>
								</Flex>
							</Grid.Col>
						</Grid>
					</AddEditMealPeriodContainer>
				)
			}
			footerContent={
				<AddEditMealPeriodFooter>
					<StyledButton
						mr={16}
						color='dark'
						variant='outline'
						onClick={() => router.push(`/merchants/${merchantId}/products`)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						onClick={() => {
							form.validate().errors
							if (isEmpty(form.validate().errors)) {
								isEdit
									? editMerchantMealPeriod({
											merchantId,
											mealPeriodId,
											mealPeriodData: {
												...form.getTransformedValues(form.values)
											}
									  })
									: addMerchantMealPeriod({
											merchantId,
											mealPeriodData: {
												...form.getTransformedValues(form.values)
											}
									  })
							}
						}}
					>
						{isEdit ? "Save changes" : "Add meal period"}
					</StyledButton>
				</AddEditMealPeriodFooter>
			}
		/>
	)
}

export default AddEditMealPeriod
