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
import useCartStore from "../../stores/useCartStore"
import {
	calculateItemSubtotal,
	calculateModifierPrice
} from "@/components/shared/utils/item-price-calculations"

const CartItem = ({
	cartItemId,
	productName,
	productImage,
	productPrice,
	productQuantity,
	productModifierOptions,
	rideCartItem = false
}: any) => {
	const { removeOrderItem, changeOrderItemQuantity } = useCartStore()

	const itemSubtotal =
		productModifierOptions.length === 0
			? productPrice * productQuantity
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
						<div>{`${
							!rideCartItem ? productQuantity : ""
						} ${productName}`}</div>
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
							removeOrderItem(cartItemId)
						}}
					>
						Remove
					</StyledButton>
				</ImageContainer>
			</Flex>
			{!rideCartItem && (
				<Flex align='center' justify='flex-end' columnGap={8}>
					<ActionIcon
						size='lg'
						radius='lg'
						variant='transparent'
						disabled={productQuantity <= 1}
						onClick={() => {
							changeOrderItemQuantity(cartItemId, productQuantity - 1)
						}}
					>
						<IconCircleMinus
							size={36}
							color={productQuantity <= 1 ? "gray" : "black"}
						/>
					</ActionIcon>
					<StyledNumberInput
						w={50}
						value={productQuantity}
						onChange={(quantity: any) => {
							if (quantity > 0) {
								changeOrderItemQuantity(cartItemId, quantity)
							}
						}}
					/>
					<ActionIcon
						size='lg'
						radius='lg'
						variant='transparent'
						onClick={() => {
							changeOrderItemQuantity(cartItemId, productQuantity + 1)
						}}
					>
						<IconCirclePlus size={36} color='black' />
					</ActionIcon>
				</Flex>
			)}
		</CartItemContainer>
	)
}

export default CartItem
