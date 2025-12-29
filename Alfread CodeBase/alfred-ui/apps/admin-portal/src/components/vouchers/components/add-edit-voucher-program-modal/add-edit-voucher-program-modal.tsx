import {
	StyledButton,
	StyledCheckbox,
	StyledDivider,
	StyledModal,
	StyledNumberInput,
	StyledRadio,
	StyledRadioGroup,
	StyledSelect,
	StyledTextInput,
	StyledTextarea
} from "@/design-components"
import { ActionIcon, Flex } from "@mantine/core"
import { useForm } from "@mantine/form"
import {
	IconTrash,
	IconPercentage,
	IconCurrencyDollar
} from "@tabler/icons-react"
import React, { useEffect, useMemo, useState } from "react"
import { randomId } from "@mantine/hooks"
import { filter, isBoolean, isEmpty, map } from "lodash"
import { DISCOUNT_VOUCHER_TYPE, VOUCHER_TYPES } from "@/shared-constants"
import useHotels from "@/hooks/hotel/useHotels"
import useHotelMealPeriods from "@/hooks/meal-period/useHotelMealPeriods"
import useHotelMenuCategories from "@/hooks/menu-category/useHotelMenuCategories"
import { customNotification } from "@/shared-utils"
import useAddVoucherProgram from "@/hooks/voucher/useAddVoucherProgram"
import useEditVoucherProgram from "@/hooks/voucher/useEditVoucherProgram"
import useVoucherProgram from "@/hooks/voucher/useVoucherProgram"
import { PreFixeRule } from "./add-edit-voucher-program-modal.style"
import HotelSelectionModal from "../hotel-selection/hotel-selection-modal"

const AddVoucherProgramModal = ({
	voucherProgramId,
	setVoucherProgramId,
	refetchVoucherPrograms,
	addVoucherProgramModalOpen,
	setAddVoucherProgramModalOpen
}: any) => {
	const [isTotalAmountPercentage, setIsTotalAmountPercentage] = useState(false)
	const [hotelSelectionOpen, setHotelSelectionOpen] = useState(false)
	const isEdit = !!voucherProgramId

	const { data: voucherProgram } = useVoucherProgram(
		{ voucherProgramId },
		{ enabled: !!voucherProgramId }
	)

	const currentVoucherProgram = voucherProgram?.data?.[0]

	const form = useForm({
		initialValues: {
			name: "",
			type: "",
			payer: "",
			hotelIds: [] as any,
			payerPercentage: 0,
			description: "",
			totalAmount: 0,
			discountCode: "",
			amountType: "",
			isActive: false,
			mealPeriodId: null,
			rules: [
				{ key: randomId(), menuCategoryIds: null, quantity: 0, maxPrice: 0 }
			]
		},
		validate: (values: any) => {
			const basicRules = {
				name: !values.name && "Voucher name is required",
				isActive: !isBoolean(values?.isActive)
					? "Is active field is requried"
					: null,
				description: !values.description && "Voucher description is required",
				payer: !values.payer && "Voucher payer is required",
				payerPercentage:
					!values.payerPercentage ||
					(!(values.payerPercentage < 100 || values.payerPercentage > 0) &&
						"Voucher payer percentage is required"),
				totalAmount: !values.totalAmount && "Voucher total amount is required"
			}

			const voucherSpecificRules = {
				type: !values.type && "Voucher type is required",
				hotelIds: isEmpty(values.hotelIds) && "At least one hotel is required"
			}

			if (values?.type === VOUCHER_TYPES.PER_DIEM?.value) {
				return isEdit ? basicRules : { ...basicRules, ...voucherSpecificRules }
			} else if (values?.type === VOUCHER_TYPES?.DISCOUNT?.value) {
				return isEdit
					? basicRules
					: {
							...basicRules,
							...voucherSpecificRules,
							discountCode:
								!values.discountCode && "Voucher discount code is required",
							amountType:
								!values.amountType && "Voucher amount type is required"
					  }
			} else {
				let rules = {}
				values.rules.forEach((rule: any, index: any) => {
					if (rule.quantity === 0) {
						rules = {
							...rules,
							[`rules.${index}.quantity`]: "Voucher quantity is required"
						}
					}
					if (rule.maxPrice === 0) {
						rules = {
							...rules,
							[`rules.${index}.maxPrice`]: "Voucher max price is required"
						}
					}
					if (!rule.menuCategoryIds) {
						rules = {
							...rules,
							[`rules.${index}.menuCategoryIds`]: "Voucher category is required"
						}
					}
				})

				return isEdit
					? basicRules
					: ({
							...rules,
							...basicRules,
							...voucherSpecificRules,
							mealPeriodId:
								!values.mealPeriodId && "Voucher meal period is required"
					  } as any)
			}
		},
		transformValues(values: any) {
			const basicValues = {
				name: values.name,
				payer: values.payer,
				isActive: values.isActive,
				description: values.description,
				payerPercentage: values.payerPercentage,
				totalAmount: values.totalAmount,
				hotelIds: values.hotelIds
			}

			const voucherSpecificValues = {
				type: values.type,
				hotelId: values.hotelId
			}

			if (values?.type === VOUCHER_TYPES.PER_DIEM.value) {
				return isEdit
					? basicValues
					: { ...basicValues, ...voucherSpecificValues }
			} else if (values?.type === VOUCHER_TYPES.DISCOUNT.value) {
				return isEdit
					? basicValues
					: {
							...basicValues,
							...voucherSpecificValues,
							amountType: values.amountType,
							discountCode: values.discountCode
					  }
			} else {
				return isEdit
					? basicValues
					: ({
							...basicValues,
							...voucherSpecificValues,
							rules: values?.rules?.map((rule: any) => ({
								quantity: rule.quantity,
								maxPrice: rule.maxPrice,
								mealPeriodId: values.mealPeriodId,
								menuCategoryIds: [rule.menuCategoryIds]
							}))
					  } as any)
			}
		}
	})
	const isPreFixe = form?.values?.type === VOUCHER_TYPES.PRE_FIXE.value
	const { data: hotels } = useHotels()
	const { data: hotelMealPeriods } = useHotelMealPeriods(
		{ hotelId: form?.values?.hotelIds?.[0] },
		{ enabled: !!form?.values?.hotelIds?.length && !hotelSelectionOpen }
	)
	const { data: hotelMenuCategories } = useHotelMenuCategories(
		{ hotelId: form?.values?.hotelIds?.[0] },
		{ enabled: !!form?.values?.hotelIds?.length && !hotelSelectionOpen }
	)

	useEffect(() => {
		if (currentVoucherProgram) {
			form.setValues({
				name: currentVoucherProgram?.name,
				description: currentVoucherProgram?.description,
				type: currentVoucherProgram?.type,
				payer: currentVoucherProgram?.payer,
				payerPercentage: parseFloat(currentVoucherProgram?.payerPercentage),
				totalAmount: parseFloat(currentVoucherProgram?.totalAmount),
				hotelIds:
					currentVoucherProgram?.hotels?.map(
						(hotel: { id: any }) => hotel.id
					) || [],
				isActive: currentVoucherProgram?.isActive,
				amountType: currentVoucherProgram?.amountType,
				discountCode: currentVoucherProgram?.discountCode?.code,
				mealPeriodId: currentVoucherProgram?.rules?.[0]?.mealPeriodId,
				rules:
					currentVoucherProgram?.rules?.map((rule: any) => ({
						key: randomId(),
						quantity: Number(rule?.quantity) || 0,
						maxPrice: Number(rule?.maxPrice) || 0,
						menuCategoryIds: rule?.menuCategoryIds?.[0] || null
					})) || []
			})
		}
	}, [currentVoucherProgram])

	const { mutate: editVoucherProgram } = useEditVoucherProgram({
		onSuccess: () => {
			customNotification.success({
				title: "Voucher program edit",
				message: "Voucher program edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Voucher program edit",
				message: "Voucher program edit failed"
			})
		},
		onSettled: () => {
			refetchVoucherPrograms()
		}
	})

	const { mutate: addVoucherProgram } = useAddVoucherProgram({
		onSuccess: () => {
			customNotification.success({
				title: "Voucher program add",
				message: "Voucher program added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Voucher program add",
				message: "Voucher program addition failed"
			})
		},
		onSettled: () => {
			refetchVoucherPrograms()
		}
	})

	const payer = form.values.payer
	const mealPeriodId = form.values.mealPeriodId

	const hotelOptions = map(hotels?.data, hotel => ({
		value: hotel?.id,
		label: hotel?.name
	}))

	const hotelMealPeriodOptions = useMemo(
		() =>
			map(hotelMealPeriods?.data, mealPeriod => ({
				value: mealPeriod?.id,
				label: mealPeriod?.name
			})),
		[hotelMealPeriods?.data]
	)

	const hotelMenuCategoryOptions = useMemo(() => {
		if (mealPeriodId) {
			return map(
				filter(hotelMenuCategories?.data, { mealPeriodId }),
				menuCategory => ({
					value: menuCategory?.id,
					label: menuCategory?.name
				})
			)
		} else {
			return []
		}
	}, [hotelMenuCategories?.data, mealPeriodId])

	const onClose = () => {
		form.reset()
		setVoucherProgramId(null)
		setAddVoucherProgramModalOpen(false)
	}

	useEffect(() => {
		if (form.values.type && form.values.amountType) {
			const isDiscount = form.values.type === VOUCHER_TYPES.DISCOUNT.value
			const isPercentage =
				form.values.amountType === DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value

			setIsTotalAmountPercentage(isDiscount && isPercentage)
		}
	}, [form.values.type, form.values.amountType])

	return (
		<StyledModal
			size='lg'
			opened={addVoucherProgramModalOpen}
			title={isEdit ? "Edit voucher program" : "Add voucher program"}
			onClose={onClose}
			modalBody={
				<Flex direction='column' rowGap={16}>
					<StyledTextInput
						label='Name'
						required
						placeholder='Name'
						{...form.getInputProps("name")}
					/>
					<StyledTextarea
						label='Description'
						required
						placeholder='Description'
						{...form.getInputProps("description")}
					/>
					<StyledDivider />
					<StyledCheckbox
						label='Is active'
						placeholder='Is active'
						{...form.getInputProps("isActive", { type: "checkbox" })}
					/>
					<StyledRadioGroup
						name='payer'
						required
						label='Payer'
						{...form.getInputProps("payer")}
						onChange={(value: any) => {
							if (value === "ALFRED_PROGRAM" || value === "ALFRED_RECOVERY") {
								form.setValues({ payer: value, payerPercentage: 100 })
							} else {
								form.setValues({ payer: value, payerPercentage: 0 })
							}
						}}
					>
						<Flex columnGap={16}>
							<StyledRadio value='HOTEL' label='Hotel' />
							<StyledRadio value='ALFRED_PROGRAM' label='Alfred Program' />
							<StyledRadio value='ALFRED_RECOVERY' label='Alfred Recovery' />
						</Flex>
					</StyledRadioGroup>
					<StyledNumberInput
						required
						min={0}
						max={100}
						precision={2}
						disabled={payer === "ALFRED_PROGRAM" || payer === "ALFRED_RECOVERY"}
						label='Payer percentage'
						placeholder='Payer percentage'
						icon={<IconPercentage color='black' />}
						{...form.getInputProps("payerPercentage")}
					/>
					<StyledRadioGroup
						name='type'
						required
						label='Type'
						disabled={isEdit}
						{...form.getInputProps("type")}
						onChange={(value: any) => {
							form.setValues({ type: value, totalAmount: 0 })
						}}
					>
						<Flex columnGap={16}>
							<StyledRadio
								disabled={isEdit}
								value={VOUCHER_TYPES.DISCOUNT.value}
								label={VOUCHER_TYPES.DISCOUNT.label}
							/>
							<StyledRadio
								disabled={isEdit}
								value={VOUCHER_TYPES.PER_DIEM.value}
								label={VOUCHER_TYPES.PER_DIEM.label}
							/>
							<StyledRadio
								disabled={isEdit}
								value={VOUCHER_TYPES.PRE_FIXE.value}
								label={VOUCHER_TYPES.PRE_FIXE.label}
							/>
						</Flex>
					</StyledRadioGroup>
					{form.values.type === VOUCHER_TYPES.DISCOUNT.value && (
						<StyledTextInput
							required
							disabled={isEdit}
							label='Discount code'
							placeholder='Discount code'
							{...form.getInputProps("discountCode")}
						/>
					)}
					{form.values.type === VOUCHER_TYPES.DISCOUNT.value && (
						<StyledRadioGroup
							name='amountType'
							required
							label='Amount type'
							disabled={isEdit}
							{...form.getInputProps("amountType")}
							onChange={(value: any) => {
								form.setValues({ amountType: value, totalAmount: 0 })
							}}
						>
							<Flex columnGap={16}>
								<StyledRadio
									disabled={isEdit}
									value={DISCOUNT_VOUCHER_TYPE.FIXED.value}
									label={DISCOUNT_VOUCHER_TYPE.FIXED.label}
								/>
								<StyledRadio
									disabled={isEdit}
									value={DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value}
									label={DISCOUNT_VOUCHER_TYPE.PERCENTAGE.label}
								/>
							</Flex>
						</StyledRadioGroup>
					)}
					<StyledNumberInput
						required
						min={0}
						precision={2}
						max={isTotalAmountPercentage ? 100 : null}
						label={
							isTotalAmountPercentage ? "Total percentage" : "Total amount"
						}
						placeholder={
							isTotalAmountPercentage ? "Total percentage" : "Total amount"
						}
						icon={
							isTotalAmountPercentage ? (
								<IconPercentage color='black' />
							) : (
								<IconCurrencyDollar color='black' />
							)
						}
						{...form.getInputProps("totalAmount")}
					/>
					<>
						<div>
							{isPreFixe ? "Select Hotel" : "Select Hotels"}{" "}
							<span style={{ color: "red" }}>*</span>
						</div>
						<StyledButton
							variant='outline'
							onClick={() => setHotelSelectionOpen(true)}
						>
							{isPreFixe ? "Select Hotel" : "Select Hotels"} (
							{form.values.hotelIds.length} selected)
						</StyledButton>

						<HotelSelectionModal
							opened={hotelSelectionOpen}
							onClose={() => setHotelSelectionOpen(false)}
							hotels={hotelOptions}
							selectedHotels={form.values.hotelIds}
							onChange={value => form.setFieldValue("hotelIds", value)}
							isPreFixe={isPreFixe}
						/>
					</>

					{form.values?.type === VOUCHER_TYPES.PRE_FIXE.value && (
						<>
							<StyledSelect
								required
								label='Select meal period'
								placeholder='Meal period'
								disabled={!form.values?.hotelIds}
								data={hotelMealPeriodOptions}
								{...form.getInputProps(`mealPeriodId`)}
								onChange={(value: any) => {
									form.setValues({
										mealPeriodId: value,
										rules: form.values.rules.length
											? form.values.rules
											: [
													{
														key: randomId(),
														menuCategoryIds: null,
														quantity: 0,
														maxPrice: 0
													}
											  ]
									})
								}}
							/>
							{form.values.rules.map((rule, index: any) => (
								<PreFixeRule key={rule.key}>
									<Flex align='center' justify='space-between'>
										<Flex direction='column'>
											<StyledSelect
												required
												label='Select category'
												placeholder='Category'
												data={hotelMenuCategoryOptions}
												disabled={
													!form.values?.hotelIds || !form.values?.mealPeriodId
												}
												{...form.getInputProps(
													`rules.${index}.menuCategoryIds`
												)}
											/>
											<Flex w='100%' columnGap={24}>
												<StyledNumberInput
													required
													label='Max items'
													placeholder='Max items'
													disabled={
														!form.values?.hotelIds || !form.values?.mealPeriodId
													}
													{...form.getInputProps(`rules.${index}.quantity`)}
												/>
												<StyledNumberInput
													required
													precision={2}
													label='Max price'
													placeholder='Max price'
													icon={<IconCurrencyDollar color='black' />}
													disabled={
														!form.values?.hotelIds || !form.values?.mealPeriodId
													}
													{...form.getInputProps(`rules.${index}.maxPrice`)}
												/>
											</Flex>
										</Flex>
										{index !== 0 && (
											<ActionIcon
												size={24}
												color='red'
												onClick={() => form.removeListItem("rules", index)}
											>
												<IconTrash size={24} />
											</ActionIcon>
										)}
									</Flex>
								</PreFixeRule>
							))}
							{!isEdit ? (
								<StyledButton
									width='fit-content'
									onClick={() =>
										form.insertListItem("rules", {
											key: randomId(),
											menuCategoryIds: null,
											quantity: 0,
											maxPrice: 0
										})
									}
								>
									Add rule
								</StyledButton>
							) : null}
						</>
					)}
				</Flex>
			}
			modalFooter={
				<Flex justify='flex-end' gap={16}>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!form.isValid()}
						color='green'
						onClick={() => {
							form.validate().errors
							if (isEmpty(form.validate().errors)) {
								isEdit
									? editVoucherProgram({
											voucherProgramId,
											voucherProgramData: form.getTransformedValues(form.values)
									  })
									: addVoucherProgram({
											voucherProgramData: form.getTransformedValues(form.values)
									  })
							}
							onClose()
						}}
					>
						{isEdit ? "Save changes" : "Add voucher program"}
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AddVoucherProgramModal
