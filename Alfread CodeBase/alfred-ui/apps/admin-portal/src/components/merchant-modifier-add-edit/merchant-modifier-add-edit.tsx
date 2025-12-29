import { PageStructure } from "@/shared-components"
import {
	StyledDivider,
	StyledTextInput,
	StyledButton,
	StyledCheckbox,
	StyledNumberInput
} from "@/design-components"
import { ActionIcon, Flex, Grid, Loader } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useRouter } from "next/router"
import useMerchantModifier from "@/hooks/modifier/useMerchantModifier"
import { IconPlus, IconTrash, IconCurrencyDollar } from "@tabler/icons-react"
import useAddMerchantModifier from "@/hooks/modifier/useAddMerchantModifier"
import { customNotification } from "@/shared-utils"
import { toString, isEmpty } from "lodash"
import useEditMerchantModifier from "@/hooks/modifier/useEditMerchantModifier"
import { useQueryClient } from "@tanstack/react-query"
import {
	AddEditModifierBody,
	AddEditModifierContainer,
	AddEditModifierFooter
} from "./merchant-modifier-add-edit.style"
import useMerchant from "@/hooks/merchant/useMerchant"
import MerchantDetailsMenu from "../shared/merchant-details-menu"

const AddEditModifier = () => {
	const router = useRouter()
	const queryClient = useQueryClient()

	const merchantId = router.query.id
	const modifierId = router.query.modifierId

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const { isLoading: merchantModifierLoading } = useMerchantModifier(
		{ modifierId: modifierId as string, merchantId },
		{
			enabled: !!modifierId && !!merchantId,
			onSuccess: (modifier: any) => {
				form.setValues({
					name: modifier?.data?.[0]?.name,
					options: modifier?.data?.[0].options.filter(
						(option: any) => option.price !== 0
					),
					freeModifierOptions: modifier?.data?.[0].options.filter(
						(option: any) => option.price === 0
					),
					requiredOptions: modifier?.data?.[0]?.requiredOptions,
					multipleOptions: modifier?.data?.[0]?.multipleOptions,
					freeModifierCount: modifier?.data?.[0]?.freeModifierCount
				})
			}
		}
	)

	const isEdit = router.pathname.includes("edit")

	const currentMerchant = merchant?.data?.[0]

	const { mutate: addMerchantModifier } = useAddMerchantModifier({
		onSuccess: () => {
			customNotification.success({
				title: "Modifier creation",
				message: "Modifier created successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Modifier creation",
				message: "Modifier creation failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["merchant_modifier"])
			queryClient.invalidateQueries(["merchant_modifiers"])
			router.push(`/merchants/${merchantId}/modifiers`)
		}
	})

	const { mutate: editMerchantModifier } = useEditMerchantModifier({
		onSuccess: () => {
			customNotification.success({
				title: "Modifier edition",
				message: "Modifier edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Modifier edition",
				message: "Modifier edit failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["merchant_modifier"])
			queryClient.invalidateQueries(["merchant_modifiers"])
			router.push(`/merchants/${merchantId}/modifiers`)
		}
	})

	const form = useForm({
		initialValues: {
			name: "",
			requiredOptions: false,
			multipleOptions: false,
			freeModifierCount: 0,
			freeModifierOptions: [{ name: "", price: "" }],
			options: [{ name: "", price: "" }]
		},
		validate: (values: any) => {
			let options = {}
			const freeModifierOptions = {}

			values.options.forEach((option: any, index: any) => {
				if (!option.name) {
					options = {
						...options,
						[`options.${index}.name`]: "Modifier option name is required"
					}
				}
				if (option.price === "") {
					options = {
						...options,
						[`options.${index}.price`]: "Modifier option price is required"
					}
				}
			})

			values.freeModifierOptions.forEach((option: any, index: any) => {
				if (!option.name) {
					options = {
						...options,
						[`freeModifierOptions.${index}.name`]:
							"Free Modifier option name is required"
					}
				}
			})

			return {
				...options,
				...freeModifierOptions,
				name: !values.name && "Modifier name is required"
			}
		},
		transformValues: values => {
			const combinedOptions = [
				...values.options.map((option: any) => ({
					name: option.name,
					price: toString(option.price)
				})),
				...values.freeModifierOptions.map(option => ({
					name: option.name,
					price: "0"
				}))
			]

			return {
				name: values.name,
				requiredOptions: values.requiredOptions,
				multipleOptions: values.multipleOptions,
				freeModifierCount: values.freeModifierCount,
				options: combinedOptions
			}
		}
	})

	return (
		<PageStructure
			title={
				currentMerchant?.name
					? `${currentMerchant?.name} - ${
							isEdit ? "Edit Modifier" : "Add Modifier"
					  }`
					: null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			goBack={true}
			pageContent={
				<>
					{isEdit && (merchantLoading || merchantModifierLoading) ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<AddEditModifierContainer>
							<AddEditModifierBody>
								<Grid gutter={40} h='100%'>
									<Grid.Col md={5}>
										<Flex direction='column' gap={16}>
											<StyledDivider
												p={0}
												m={0}
												size='xs'
												color='gray.6'
												labelPosition='center'
												label='MODIFIER OVERVIEW'
											/>
											<StyledTextInput
												label='Name'
												placeholder='Modifier name'
												required={true}
												{...form.getInputProps("name")}
											/>
											<StyledCheckbox
												label='Is required?'
												{...form.getInputProps("requiredOptions", {
													type: "checkbox"
												})}
											/>
											<StyledCheckbox
												label='Is multi-option?'
												{...form.getInputProps("multipleOptions", {
													type: "checkbox"
												})}
											/>
											<StyledNumberInput
												label='Free Modifiers Count'
												placeholder='Select how many modifiers are free'
												{...form.getInputProps("freeModifierCount")}
											/>

											<>
												<StyledDivider
													p={0}
													m={0}
													size='xs'
													color='gray.6'
													labelPosition='center'
													label='FREE MODIFIER OPTIONS'
												/>
												{form.values.freeModifierOptions.map(
													(freeOption: any, index: any) => (
														<Grid w='100%' key={freeOption?.id} align='center'>
															<Grid.Col span={5}>
																<StyledTextInput
																	label='Name'
																	required
																	placeholder='Option name'
																	{...form.getInputProps(
																		`freeModifierOptions.${index}.name`
																	)}
																/>
															</Grid.Col>
															<Grid.Col span={5}>
																<StyledNumberInput
																	label='Price'
																	required
																	hideControls
																	precision={2}
																	placeholder='Option price'
																	icon={<IconCurrencyDollar color='black' />}
																	value={0}
																	disabled
																/>
															</Grid.Col>
															<Grid.Col span={2}>
																<ActionIcon
																	color='red'
																	onClick={() =>
																		form.removeListItem(
																			"freeModifierOptions",
																			index
																		)
																	}
																	mt={20}
																>
																	<IconTrash size={22} />
																</ActionIcon>
															</Grid.Col>
														</Grid>
													)
												)}
												<StyledButton
													onClick={() =>
														form.insertListItem("freeModifierOptions", {
															name: "",
															price: ""
														})
													}
													leftIcon={<IconPlus />}
												>
													Add Free modifier option
												</StyledButton>
											</>

											<StyledDivider
												p={0}
												m={0}
												size='xs'
												color='gray.6'
												labelPosition='center'
												label='MODIFIER OPTIONS'
											/>
											<>
												{form.values.options.map((option: any, index: any) => (
													<Grid w='100%' key={option?.id} align='center'>
														<Grid.Col span={5}>
															<StyledTextInput
																label='Name'
																required
																placeholder='Option name'
																{...form.getInputProps(`options.${index}.name`)}
															/>
														</Grid.Col>
														<Grid.Col span={5}>
															<StyledNumberInput
																label='Price'
																required
																hideControls
																precision={2}
																placeholder='Option price'
																icon={<IconCurrencyDollar color='black' />}
																{...form.getInputProps(
																	`options.${index}.price`
																)}
															/>
														</Grid.Col>
														<Grid.Col span={2}>
															<ActionIcon
																color='red'
																onClick={() =>
																	form.removeListItem("options", index)
																}
																mt={20}
															>
																<IconTrash size={22} />
															</ActionIcon>
														</Grid.Col>
													</Grid>
												))}
											</>
											<StyledButton
												onClick={() =>
													form.insertListItem("options", {
														name: "",
														price: ""
													})
												}
												leftIcon={<IconPlus />}
											>
												Add modifier option
											</StyledButton>
										</Flex>
									</Grid.Col>
									<Grid.Col md={4}></Grid.Col>
								</Grid>
							</AddEditModifierBody>
						</AddEditModifierContainer>
					)}
				</>
			}
			footerContent={
				<AddEditModifierFooter>
					<StyledButton
						variant='outline'
						color='dark'
						mr={16}
						onClick={() => router.push(`/merchants/${merchantId}/modifiers`)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						onClick={() => {
							form.validate().errors
							if (isEmpty(form.validate().errors)) {
								const transformedValues = form.getTransformedValues()
								if (
									form.values.freeModifierCount > 0 &&
									form.values.freeModifierOptions.length <
										form.values.freeModifierCount
								) {
									customNotification.error({
										title: "Modifier edition",
										message: `Please input atleast ${form.values.freeModifierCount} or more as free modifier options`
									})
								} else {
									isEdit
										? editMerchantModifier({
												modifierId,
												merchantId,
												modifierData: transformedValues
										  })
										: addMerchantModifier({
												merchantId,
												modifierData: transformedValues
										  })
								}
							}
						}}
					>
						{isEdit ? "Save changes" : "Add modifier"}
					</StyledButton>
				</AddEditModifierFooter>
			}
		/>
	)
}

export default AddEditModifier
