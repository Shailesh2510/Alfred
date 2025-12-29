import { Flex, List, Image } from "@mantine/core"
import { StyledButton } from "@/design-components"
import { showPrice } from "@/shared-utils"

import styled from "@emotion/styled"
import useRideStore from "../../store/useRideStore"

const CartItemContainer = styled.div`
	padding: 16px 0;
`

const ProductName = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.lg600};
	color: ${({ theme }) => theme.colors.dark[6]};
`

const ItemOption = styled(List.Item)`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
	b {
		${({ theme }) => theme.other.typography.sm700};
	}
`

const ImageContainer = styled.div`
	position: relative;
`

const CartItem = ({
	productName,
	productImage,
	productPrice,
	productQuantity,
	productModifierOptions,
	rideCartItem = false
}: any) => {
	const { removeRide } = useRideStore()
	return (
		<CartItemContainer>
			<Flex justify='space-between'>
				<Flex direction='column' w='100%' mr={8}>
					<ProductName>
						<div>{`${
							!rideCartItem ? productQuantity : ""
						} ${productName}`}</div>
						<div>{showPrice(productPrice)}</div>
					</ProductName>
					<List ml={12}>
						{productModifierOptions.map((option: any) => (
							<ItemOption key={option?.id}>
								{option?.name}&nbsp;&nbsp;
								<b>{showPrice(option?.price)}</b>
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
							rideCartItem && removeRide()
						}}
					>
						Remove
					</StyledButton>
				</ImageContainer>
			</Flex>
		</CartItemContainer>
	)
}

export default CartItem
