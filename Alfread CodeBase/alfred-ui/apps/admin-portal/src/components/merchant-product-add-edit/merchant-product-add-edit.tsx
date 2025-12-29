import { PageStructure } from "@/shared-components"
import {
	StyledDivider,
	StyledTextInput,
	StyledTextarea,
	StyledButton,
	StyledMultiSelect,
	StyledNumberInput,
	StyledDateTimePicker
} from "@/design-components"
import { BackgroundImage, Flex, Grid, Loader } from "@mantine/core"
import { useForm } from "@mantine/form"
import {
	IconPhoto,
	IconCalendar,
	IconUpload,
	IconX,
	IconCurrencyDollar
} from "@tabler/icons-react"
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useEffect, useMemo, useState } from "react"
import useMerchantModifiers from "@/hooks/modifier/useMerchantModifiers"
import { map, toNumber, toString, isEmpty } from "lodash"
import { useRouter } from "next/router"
import useMerchantProduct from "@/hooks/merchant-product/useMerchantProduct"
import useEditMerchantProduct from "@/hooks/merchant-product/useEditMerchantProduct"
import useAddMerchantProduct from "@/hooks/merchant-product/useAddMerchantProduct"
import {
	createDateFromString,
	customNotification,
	formatDate,
	longDateFormat
} from "@/shared-utils"
import useMerchantMealPeriods from "@/hooks/meal-period/useMerchantMealPeriods"
import API from "@/services/api"
import { useQueryClient } from "@tanstack/react-query"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import {
	AddEditProductContainer,
	AddEditProductFooter,
	InStockAfterLabel,
	ProductStockLabel
} from "./merchant-product-add-edit.style"
import useMerchant from "@/hooks/merchant/useMerchant"
import { FILTER_SIZE, ICON_SIZE } from "@/shared-constants"
import useUpdateProductStock from "@/hooks/stock/useUpdateProductStock"
import { isBefore, isSameDay } from "date-fns"

const AddEditProduct = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const merchantId = router.query.id
	const productId = router.query.productId

	const [tagOptions, setTagOptions] = useState<any>([])
	const [uploadedImage, setUploadedImage] = useState(null)
	const [imageUploading, setImageUploading] = useState(false)
	const [productAvailableAfter, setProductAvailableAfter] =
		useState<Date | null>(null)

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)
	const { data: merchantModifiers } = useMerchantModifiers(
		{ merchantId },
		{ enabled: !!merchantId }
	)
	const { data: merchantMealPeriods } = useMerchantMealPeriods(
		{ merchantId },
		{ enabled: !!merchantId }
	)

	const isEdit = router.pathname.includes("edit")

	const {
		data: merchantProduct,
		isLoading: merchantProductLoading,
		refetch: refetchMerchantProduct
	} = useMerchantProduct(
		{ productId, merchantId },
		{
			enabled: !!productId && !!merchantId
		}
	)

	const currentMerchant = merchant?.data?.[0]
	const currentProduct = merchantProduct?.data?.[0]

	useEffect(() => {
		if (currentProduct) {
			form.setValues({
				name: currentProduct?.name,
				description: currentProduct?.description || "",
				price: (currentProduct?.price
					? toNumber(currentProduct?.price)
					: undefined) as any,
				tags: currentProduct?.tags?.length
					? currentProduct?.tags?.replace(/"|}|{/g, "")?.split(",")
					: "",
				modifierIds: currentProduct?.modifiers.map((modifier: any) =>
					modifier.id.toString()
				),
				mealPeriodIds: currentProduct?.mealPeriods.map((mealPeriod: any) =>
					mealPeriod?.id?.toString()
				),
				orderQuantity: currentProduct?.orderQuantity
			})
		}
	}, [currentProduct])

	const { mutate: editMerchantProduct } = useEditMerchantProduct({
		onSuccess: () => {
			customNotification.success({
				title: "Product edit",
				message: "Product edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Product edit",
				message: "Product edit failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["hotel"])
			queryClient.invalidateQueries(["merchant_product"])
			queryClient.invalidateQueries(["merchant_products"])
			router.push(`/merchants/${merchantId}/products`)
		}
	})

	const { mutate: addMerchantProduct } = useAddMerchantProduct({
		onSuccess: () => {
			customNotification.success({
				title: "Product add",
				message: "Product added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Product add",
				message: "Product addition failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["hotel"])
			queryClient.invalidateQueries(["merchant_product"])
			queryClient.invalidateQueries(["merchant_products"])
			router.push(`/merchants/${merchantId}/products`)
		}
	})

	const { mutate: updateProductStock } = useUpdateProductStock({
		onSuccess: () => {
			customNotification.success({
				title: "Product stock",
				message: "Product stock updated successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Product stock",
				message: "Product stock failed to update"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["hotel"])
			refetchMerchantProduct()
		}
	})

	const form = useForm({
		initialValues: {
			name: "",
			tags: [],
			price: "",
			modifierIds: [],
			mealPeriodIds: [],
			description: "",
			imageUrl: "",
			orderQuantity: 1
		},
		validate: values => ({
			name: !values.name && "Product name is required",
			price: !values.price && "Product price is required",
			mealPeriodIds:
				!values.mealPeriodIds?.length && "Select at least one meal period",
			orderQuantity:
				values.orderQuantity < 1 && "Order quantity must be greater than 1"
		}),
		transformValues: values => ({
			name: values.name ? values.name : "",
			price: values.price ? toString(values.price) : "0",
			description: values.description ? values.description : "",
			imageUrl: uploadedImage ? uploadedImage : "",
			modifierIds: values.modifierIds?.map(toNumber),
			mealPeriodIds: values.mealPeriodIds?.map(toNumber),
			tags: values.tags.length
				? `{${values.tags.map(tag => `"${tag}"`).join(",")}}`
				: "",
			orderQuantity: values.orderQuantity
		})
	})

	const modifierOptions = useMemo(
		() =>
			map(merchantModifiers?.data || [], (modifier: any) => ({
				value: modifier.id.toString(),
				label: modifier.name
			})),
		[merchantModifiers]
	)

	const mealPeriodOptions = useMemo(
		() =>
			map(merchantMealPeriods?.data || [], (mealPeriod: any) => ({
				value: mealPeriod.id.toString(),
				label: mealPeriod.name
			})),
		[merchantMealPeriods]
	)

	useEffect(() => {
		if (currentProduct?.tags) {
			setTagOptions(
				currentProduct?.tags?.replace(/"|}|{/g, "")?.split(",") || []
			)
		}
		if (currentProduct?.imageUrl) {
			setUploadedImage(currentProduct?.imageUrl)
		}
	}, [currentProduct])

	useEffect(() => {
		setProductAvailableAfter(
			currentProduct?.outOfStockAvailableAfter
				? createDateFromString(currentProduct?.outOfStockAvailableAfter)
				: null
		)
	}, [currentProduct])

	return (
		<PageStructure
			title={
				currentMerchant?.name
					? `${currentMerchant?.name} - ${
							isEdit ? "Edit Product" : "Add Product"
					  }`
					: null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			goBack={true}
			pageContent={
				isEdit && (merchantLoading || merchantProductLoading) ? (
					<Flex mih={600} w='100%' justify='center' align='center'>
						<Loader />
					</Flex>
				) : (
					<AddEditProductContainer>
						<Grid gutter={40} h='100%'>
							<Grid.Col md={4}>
								<Flex direction='column' gap={16}>
									<StyledDivider
										p={0}
										m={0}
										size='xs'
										color='gray.6'
										labelPosition='center'
										label='PRODUCT OVERVIEW'
									/>
									<StyledTextInput
										label='Product name'
										placeholder='Product name'
										required
										{...form.getInputProps("name")}
									/>
									<StyledMultiSelect
										label='Tags'
										creatable
										searchable
										onCreate={(query: string) => {
											const item = { value: query, label: query }
											setTagOptions((current: any) => [...current, item])
											return item
										}}
										data={tagOptions}
										getCreateLabel={(query: string) => `+ Create "${query}"`}
										placeholder='Product tags'
										{...form.getInputProps("tags")}
									/>
									<StyledTextarea
										minRows={4}
										maxRows={20}
										label='Description'
										placeholder='Product description'
										{...form.getInputProps("description")}
									/>

									<StyledNumberInput
										label='Order Quantity'
										placeholder='Minimum Order Quantity'
										hideControls
										{...form.getInputProps("orderQuantity")}
									/>
									<StyledDivider
										p={0}
										m={0}
										size='xs'
										color='gray.6'
										label='PRICE'
										labelPosition='center'
									/>
									<StyledNumberInput
										label='Price'
										required
										placeholder='Product price'
										hideControls
										precision={2}
										icon={<IconCurrencyDollar color='black' />}
										{...form.getInputProps("price")}
									/>
								</Flex>
							</Grid.Col>
							<Grid.Col md={4}>
								<Flex direction='column' gap={16}>
									<StyledDivider
										color='gray.6'
										size='xs'
										labelPosition='center'
										label='IMAGE'
										p={0}
										m={0}
									/>
									<Dropzone
										p={0}
										h={230}
										w={230}
										loading={imageUploading}
										radius={8}
										maxFiles={1}
										onDrop={(files: any[]) => {
											setImageUploading(true)
											API.getMerchantPresignedUrl({ merchantId }).then(url => {
												API.uploadMerchantProductImage(
													url?.data?.[0].url,
													files[0]
												)
													.then(() => {
														setUploadedImage(url?.data?.[0].imageUrl)
													})
													.catch(() =>
														customNotification.error({
															title: "Image upload",
															message: "Image upload failed"
														})
													)
													.finally(() => setImageUploading(false))
											})
										}}
										onReject={(files: any) =>
											customNotification.error({
												title: "File upload",
												message: files[0]?.name
													? `File ${files[0]?.name} was not uploaded`
													: "File was not uploaded"
											})
										}
										maxSize={3 * 1024 ** 2}
										accept={IMAGE_MIME_TYPE}
									>
										<Flex justify='center' align='center' h={226} w={226}>
											<BackgroundImage
												src={uploadedImage ? uploadedImage : ""}
												h={226}
												w={226}
												radius={8}
											>
												<Flex justify='center' align='center' h={226} w={226}>
													<Dropzone.Accept>
														<IconUpload size='3.2rem' stroke={1.5} />
													</Dropzone.Accept>
													<Dropzone.Reject>
														<IconX size='3.2rem' stroke={1.5} />
													</Dropzone.Reject>
													<Dropzone.Idle>
														<IconPhoto size='3.2rem' stroke={1.5} />
													</Dropzone.Idle>
												</Flex>
											</BackgroundImage>
										</Flex>
									</Dropzone>
									<StyledDivider
										p={0}
										m={0}
										color='gray.6'
										size='xs'
										labelPosition='center'
										label='MODIFIERS'
									/>
									<Flex
										w='100%'
										gap={10}
										align='center'
										justify='space-between'
									>
										<StyledMultiSelect
											label='Modifiers'
											data={modifierOptions}
											placeholder='Select modifiers'
											w='100%'
											{...form.getInputProps("modifierIds")}
										/>
									</Flex>
									<Flex
										w='100%'
										gap={10}
										align='center'
										justify='space-between'
									>
										<StyledMultiSelect
											label='Meal periods'
											required
											data={mealPeriodOptions}
											placeholder='Select meal periods'
											w='100%'
											{...form.getInputProps("mealPeriodIds")}
										/>
									</Flex>
								</Flex>
							</Grid.Col>
							<Grid.Col md={4}>
								<StyledDivider
									p={0}
									m={0}
									size='xs'
									color='gray.6'
									label='UPDATE STOCK'
									labelPosition='center'
								/>
								{isEdit && (
									<Flex
										columnGap={24}
										align='center'
										mt={24}
										justify='center'
										direction='column'
									>
										<ProductStockLabel
											outOfStock={currentProduct?.outOfStockId}
										>
											Product is:{" "}
											<b>
												{currentProduct?.outOfStockId
													? "Out of Stock"
													: "In Stock"}
											</b>
										</ProductStockLabel>
										<Flex
											align='center'
											justify='center'
											columnGap={24}
											mt={24}
										>
											{!currentProduct?.outOfStockId ? (
												<StyledDateTimePicker
													w={200}
													clearable={true}
													size={FILTER_SIZE}
													excludeDate={(date: Date) => {
														if (isSameDay(date, new Date())) {
															return false
														}
														return isBefore(date, new Date())
													}}
													placeholder='Available after'
													value={productAvailableAfter}
													icon={<IconCalendar size={ICON_SIZE} />}
													onChange={(value: any) =>
														setProductAvailableAfter(value)
													}
												/>
											) : (
												<>
													{currentProduct?.outOfStockAvailableAfter && (
														<Flex direction='column'>
															<InStockAfterLabel>
																In stock after:
															</InStockAfterLabel>
															<InStockAfterLabel>
																<b>
																	{formatDate(
																		createDateFromString(
																			currentProduct?.outOfStockAvailableAfter
																		),
																		longDateFormat
																	)}
																</b>
															</InStockAfterLabel>
														</Flex>
													)}
												</>
											)}
											<StyledButton
												color={currentProduct?.outOfStockId ? "green" : "red"}
												onClick={() => {
													let payload: any = {
														merchantId,
														itemId: currentProduct?.id,
														out: currentProduct?.outOfStockId ? "false" : "true"
													}
													if (productAvailableAfter) {
														payload = {
															...payload,
															availableAfter: productAvailableAfter
														}
													}
													updateProductStock(payload)
												}}
											>
												{currentProduct?.outOfStockId
													? "Update status to 'IN STOCK'"
													: "Update status to 'OUT OF STOCK'"}
											</StyledButton>
										</Flex>
									</Flex>
								)}
							</Grid.Col>
						</Grid>
					</AddEditProductContainer>
				)
			}
			footerContent={
				<AddEditProductFooter>
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
									? editMerchantProduct({
											productId,
											merchantId,
											productData: { ...form.getTransformedValues(form.values) }
									  })
									: addMerchantProduct({
											merchantId,
											productData: { ...form.getTransformedValues(form.values) }
									  })
							}
						}}
					>
						{isEdit ? "Save changes" : "Add product"}
					</StyledButton>
				</AddEditProductFooter>
			}
		/>
	)
}

export default AddEditProduct
