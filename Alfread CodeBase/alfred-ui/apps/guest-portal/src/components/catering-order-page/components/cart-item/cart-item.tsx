import { ActionIcon, Flex, List, Image } from "@mantine/core"
import {
	CartItemContainer,
	ImageContainer,
	ItemOption,
	ProductName
} from "./cart-item.style"
import { IconCircleMinus, IconCirclePlus } from "@tabler/icons-react"
import { StyledButton, StyledNumberInput } from "@/design-components"
import { showPrice } from "@/shared-utils"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import {
	calculateItemSubtotal,
	calculateModifierPrice
} from "../../../shared/utils/item-price-calculations"

const CartItem = ({
	dispatchCart,
	cartItemId,
	productName,
	productImage,
	productPrice,
	productQuantity,
	productModifierOptions,
	minimumOrderQuantity
}: any) => {
	const itemSubtotal =
		productQuantity === 0
			? 0
			: calculateItemSubtotal({
					productPrice,
					productQuantity,
					productModifierOptions
			  })

	return (
		<CartItemContainer>
			<Flex justify='space-between'>
				<Flex direction='column' w='100%' mr={8}>
					<ProductName>
						<div>{`${productQuantity} ${productName}`}</div>
						<div>{showPrice(itemSubtotal)}</div>
					</ProductName>
					<List ml={12}>
						{productModifierOptions.map((option: any) => (
							<ItemOption key={option?.id}>
								{option?.name}&nbsp;&nbsp;
								<b>
									{showPrice(
										calculateModifierPrice(option?.price, productQuantity)
									)}
								</b>
							</ItemOption>
						))}
					</List>
				</Flex>
				<ImageContainer>
					<Image
						src={productImage || "/food.jpg"}
						alt={productName}
						width={100}
						height={100}
						mb={24}
						radius={8}
					/>
					<StyledButton
						color='dark.9'
						variant='outline'
						pos='absolute'
						top={4}
						right={4}
						onClick={() => {
							dispatchCart({
								type: cartActionTypes.REMOVE_ORDER_ITEM,
								cartItemId
							})
						}}
					>
						Remove
					</StyledButton>
				</ImageContainer>
			</Flex>
			<Flex align='center' justify='flex-end' columnGap={8}>
				<ActionIcon
					size='lg'
					radius='lg'
					variant='transparent'
					disabled={productQuantity <= minimumOrderQuantity}
					onClick={() => {
						dispatchCart({
							type: cartActionTypes.CHANGE_ORDER_ITEM_QUANTITY,
							item: { cartItemId, quantity: productQuantity - 1 }
						})
					}}
				>
					<IconCircleMinus
						size={36}
						color={productQuantity <= minimumOrderQuantity ? "gray" : "black"}
					/>
				</ActionIcon>
				<StyledNumberInput
					w={50}
					value={productQuantity}
					onChange={(quantity: any) => {
						if (quantity >= minimumOrderQuantity) {
							dispatchCart({
								type: cartActionTypes.CHANGE_ORDER_ITEM_QUANTITY,
								item: { cartItemId, quantity }
							})
						}
					}}
				/>
				<ActionIcon
					size='lg'
					radius='lg'
					variant='transparent'
					onClick={() => {
						dispatchCart({
							type: cartActionTypes.CHANGE_ORDER_ITEM_QUANTITY,
							item: { cartItemId, quantity: productQuantity + 1 }
						})
					}}
				>
					<IconCirclePlus size={36} color='black' />
				</ActionIcon>
			</Flex>
		</CartItemContainer>
	)
}

export default CartItem
