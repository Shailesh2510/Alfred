import {
	StyledBadge,
	StyledButton,
	StyledDivider,
	StyledModal,
	StyledNumberInput
} from "@/design-components"
import {
	ActionIcon,
	Checkbox,
	Divider,
	Flex,
	Image,
	Radio
} from "@mantine/core"
import { IconX, IconCirclePlus, IconCircleMinus } from "@tabler/icons-react"
import { showPrice } from "@/shared-utils"
import React, { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { filter, find, includes, map } from "lodash"
import calculateTotalPrice from "../../utils/calculateTotalPrice"
import {
	ProductName,
	ProductDescription,
	ModalSubtitle,
	PriceAfterDiscount,
	SectionSubtitle,
	ModifierOptionPrice,
	AddOnText
} from "./order-item-modal.style"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import { isMobileOnly } from "react-device-detect"
import { useForm } from "@mantine/form"

interface IOrderItemModalProps {
	product: any
	cartState: any
	dispatchCart: any
	orderItemModalOpen: boolean
	setOrderItemModalOpen: any
}

const OrderItemModal = (properties: IOrderItemModalProps) => {
	const {
		product,
		cartState,
		dispatchCart,
		orderItemModalOpen,
		setOrderItemModalOpen
	} = properties
	const tags = product?.tags
		?.replace(/"|}|{/g, "")
		?.split(",")
		?.filter((tag: any) => tag)

	const form = useForm({
		initialValues: {
			orderQuantity: product.orderQuantity
		},
		validate: values => ({
			orderQuantity:
				values.orderQuantity < product?.orderQuantity &&
				`Order quantity must be greater than ${product?.orderQuantity}`
		})
	})

	useEffect(() => {
		if (orderItemModalOpen && product) {
			dispatchCart({
				type: cartActionTypes.ADD_TEMPORARY_ITEM,
				temporaryItem: {
					quantity: product?.orderQuantity,
					modifiers: [],
					id: product?.id,
					name: product?.name,
					cartItemId: uuidv4(),
					cartItemTime: new Date(),
					imageUrl: product?.imageUrl,
					price: parseFloat(product?.price),
					tags: tags,
					mealPeriodId: product?.mealPeriodId,
					minimumOrderQuantity: product?.orderQuantity
				}
			})
		}
	}, [orderItemModalOpen])

	const requiredModifierIds = map(
		filter(product?.modifiers, { requiredOptions: true }),
		"id"
	)
	const selectedModifierIds = map(
		cartState.temporaryItem?.modifiers?.filter(
			(modifier: any) => modifier.options.length > 0
		),
		"id"
	)

	const buttonEnabled = requiredModifierIds?.every(modifierId =>
		includes(selectedModifierIds, modifierId)
	)

	const handleChange = (modifierOptionIds: any, modifier: any) => {
		dispatchCart({
			type: cartActionTypes.ADD_TEMPORARY_ITEM_MODIFIER_OPTION,
			temporaryItemModifier: {
				id: modifier?.id,
				options: map(modifierOptionIds, modifierOptionId => {
					const option = find(modifier?.options, {
						id: parseInt(modifierOptionId)
					})

					return {
						quantity: product?.orderQuantity,
						id: parseInt(modifierOptionId),
						name: option?.name,
						price: option?.price
					}
				})
			}
		})
	}

	const onClose = () => {
		setOrderItemModalOpen(false)
		setTimeout(() => {
			dispatchCart({
				type: cartActionTypes.RESET_TEMPORARY_ITEM
			})
		}, 500)
	}

	return (
		<StyledModal
			size='lg'
			centered={true}
			yOffset='10vh'
			opened={orderItemModalOpen}
			showHeader={false}
			onClose={onClose}
			modalBody={
				<Flex direction='column' mih={400} rowGap={16}>
					<Flex justify='space-between'>
						<ProductName>{product?.name}</ProductName>
						<ActionIcon onClick={onClose} size='sm'>
							<IconX size={16} />
						</ActionIcon>
					</Flex>
					<ProductDescription>{product?.description}</ProductDescription>
					{tags?.length ? (
						<Flex>
							{tags?.map((tag: any) => (
								<StyledBadge key={tag} mr={4}>
									{tag}
								</StyledBadge>
							))}
						</Flex>
					) : null}
					<Image
						src={product?.imageUrl || "/food.jpg"}
						alt={product?.name}
						width='100%'
						radius={8}
						mb={24}
					/>
					<>
						{product?.modifiers?.length ? (
							<>
								<ModalSubtitle>Choose Add On</ModalSubtitle>
								{product?.modifiers?.map((modifier: any) => (
									<React.Fragment key={modifier?.id}>
										<SectionSubtitle>
											{`${modifier?.name} ${
												modifier?.requiredOptions ? "(Required)" : ""
											}`}
										</SectionSubtitle>
										{modifier?.multipleOptions ? (
											<>
												{/* Free Modifier Checkbox Group */}
												{modifier?.options.filter(
													(option: any) => option.price === 0
												).length > 0 && (
													<>
														<AddOnText>
															Choose up to {modifier?.freeModifierCount} items
															(included):
														</AddOnText>

														<Checkbox.Group
															required={modifier?.requiredOptions}
															withAsterisk
															value={map(
																find(cartState?.temporaryItem?.modifiers, {
																	id: modifier?.id
																})?.options,
																option => option?.id?.toString()
															)}
															onChange={(modifierOptionIds: any) => {
																const selectedOptions =
																	modifier?.options?.filter((option: any) =>
																		modifierOptionIds.includes(
																			option.id.toString()
																		)
																	)
																const freeOptionsCount =
																	selectedOptions?.filter(
																		(option: any) => option.price === 0
																	)?.length || 0

																if (
																	freeOptionsCount <=
																	modifier?.freeModifierCount
																) {
																	handleChange(modifierOptionIds, modifier)
																}
															}}
														>
															{modifier?.options
																.filter((option: any) => option.price === 0)
																.map((modifierOption: any) => (
																	<React.Fragment key={modifierOption?.id}>
																		<StyledDivider color='gray.3' />
																		<Flex
																			align='center'
																			justify='space-between'
																		>
																			<Checkbox
																				my={12}
																				value={modifierOption?.id?.toString()}
																				label={modifierOption?.name}
																			/>
																		</Flex>
																	</React.Fragment>
																))}
														</Checkbox.Group>
													</>
												)}

												{/* Paid Modifier Checkbox Group */}
												{modifier?.options.filter(
													(option: any) => option.price !== 0
												).length > 0 && (
													<>
														<Divider
															size='sm'
															label={`Paid Add-On's`}
															labelPosition='center'
															styles={{ label: { paddingBottom: "10px" } }}
														/>
														<Checkbox.Group
															required={modifier?.requiredOptions}
															value={map(
																find(cartState?.temporaryItem?.modifiers, {
																	id: modifier?.id
																})?.options,
																option => option?.id?.toString()
															)}
															onChange={(modifierOptionIds: any) => {
																handleChange(modifierOptionIds, modifier)
															}}
														>
															{modifier?.options
																.filter((option: any) => option.price !== 0)
																.map((modifierOption: any) => (
																	<React.Fragment key={modifierOption?.id}>
																		<StyledDivider color='gray.3' />
																		<Flex
																			align='center'
																			justify='space-between'
																		>
																			<Checkbox
																				my={12}
																				value={modifierOption?.id?.toString()}
																				label={modifierOption?.name}
																			/>
																			<ModifierOptionPrice>
																				+{showPrice(modifierOption?.price)}
																			</ModifierOptionPrice>
																		</Flex>
																	</React.Fragment>
																))}
														</Checkbox.Group>
													</>
												)}
											</>
										) : (
											<Radio.Group
												required={modifier?.requiredOptions}
												value={find(cartState?.temporaryItem?.modifiers, {
													id: modifier?.id
												})?.options?.[0]?.id?.toString()}
												onChange={modifierOptionId => {
													dispatchCart({
														type: cartActionTypes.ADD_TEMPORARY_ITEM_MODIFIER_OPTION,
														temporaryItemModifier: {
															id: modifier?.id,
															options: [
																{
																	quantity: 1,
																	id: parseInt(modifierOptionId),
																	name: find(modifier?.options, {
																		id: parseInt(modifierOptionId)
																	})?.name,
																	price: find(modifier?.options, {
																		id: parseInt(modifierOptionId)
																	})?.price
																}
															]
														}
													})
												}}
											>
												{modifier?.options?.map((modifierOption: any) => (
													<React.Fragment key={modifierOption?.id}>
														<StyledDivider color='gray.3' />
														<Flex align='center' justify='space-between'>
															<Radio
																my={12}
																value={modifierOption?.id?.toString()}
																label={modifierOption?.name}
															/>
															<ModifierOptionPrice>
																+{showPrice(modifierOption?.price)}
															</ModifierOptionPrice>
														</Flex>
													</React.Fragment>
												))}
											</Radio.Group>
										)}
									</React.Fragment>
								))}
							</>
						) : null}
					</>
					{/* <ModalSubtitle>Add special instruction</ModalSubtitle>
			<StyledTextarea
			  autosize
			  minRows={3}
			  placeholder="Add any special requests (e.g., food allergies, extra spicy, etc.) and the store will do its best to accommodate you."
			/> */}
				</Flex>
			}
			modalFooter={
				<Flex
					gap={isMobileOnly ? "0.2rem" : "sm"}
					justify={"space-between"}
					align={"center"}
				>
					<Flex gap={isMobileOnly ? "0.2rem" : "sm"} align='center'>
						<ActionIcon
							size='md'
							radius='lg'
							variant='transparent'
							disabled={
								cartState?.temporaryItem?.quantity <= product?.orderQuantity
							}
						>
							<IconCircleMinus
								size={30}
								color={
									cartState?.temporaryItem?.quantity <= product?.orderQuantity
										? "gray"
										: "black"
								}
								onClick={() => {
									if (cartState?.temporaryItem?.quantity > 1) {
										dispatchCart({
											type: cartActionTypes.CHANGE_TEMPORARY_ITEM_QUANTITY,
											quantity: cartState?.temporaryItem?.quantity - 1
										})
										form.setValues({
											orderQuantity: cartState?.temporaryItem?.quantity - 1
										})
									}
								}}
							/>
						</ActionIcon>
						<StyledNumberInput
							w={isMobileOnly ? 40 : 50}
							min={1}
							value={cartState?.temporaryItem?.quantity}
							onChange={(value: any) => {
								if (value > 0) {
									dispatchCart({
										type: cartActionTypes.CHANGE_TEMPORARY_ITEM_QUANTITY,
										quantity: value
									})
									form.setValues({ orderQuantity: value })
								}
							}}
						/>
						<ActionIcon size='md' radius='lg' variant='transparent'>
							<IconCirclePlus
								size={30}
								color='black'
								onClick={() => {
									dispatchCart({
										type: cartActionTypes.CHANGE_TEMPORARY_ITEM_QUANTITY,
										quantity: cartState?.temporaryItem?.quantity + 1
									})
									form.setValues({
										orderQuantity: cartState?.temporaryItem?.quantity + 1
									})
								}}
							/>
						</ActionIcon>
					</Flex>
					<Flex gap={isMobileOnly ? "0.5rem" : "sm"}>
						<Flex align='center' columnGap={8}>
							<PriceAfterDiscount>
								{showPrice(
									calculateTotalPrice({ items: [cartState.temporaryItem] })
										.totalPrice
								)}
							</PriceAfterDiscount>
						</Flex>
						<StyledButton
							disabled={!buttonEnabled || !form.isValid()}
							onClick={() => {
								if (form.isValid()) {
									dispatchCart({
										type: cartActionTypes.ADD_ORDER_ITEM,
										item: cartState?.temporaryItem
									})
									onClose()
								}
							}}
						>
							Add to cart
						</StyledButton>
					</Flex>
				</Flex>
			}
		/>
	)
}

export default OrderItemModal
