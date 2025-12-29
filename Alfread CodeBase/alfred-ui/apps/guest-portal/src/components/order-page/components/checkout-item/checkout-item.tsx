import { Flex, List, Image } from "@mantine/core"
import {
	CheckoutItemContainer,
	ItemOption,
	ProductDetails,
	ProductName,
	ProductPrice
} from "./checkout-item.style"
import { showPrice } from "@/shared-utils"
import { useMediaQuery } from "@mantine/hooks"
import {
	calculateItemSubtotal,
	calculateModifierPrice
} from "../../../shared/utils/item-price-calculations"

const CheckoutItem = ({
	productName,
	productQuantity,
	productPrice,
	productModifierOptions,
	productImage,
	hideItemImageOnCheckOutPage = false
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 400px)")

	const itemSubtotal =
		productQuantity === 0
			? 0
			: calculateItemSubtotal({
					productPrice,
					productQuantity,
					productModifierOptions
			  })

	return (
		<CheckoutItemContainer>
			<Flex justify='space-between'>
				<Flex direction='column' w='100%' mr={8}>
					<ProductDetails>
						<ProductName
							$sm={isSmallScreen}
						>{`${productQuantity} ${productName}`}</ProductName>
						<ProductPrice>{showPrice(itemSubtotal)}</ProductPrice>
					</ProductDetails>
					<List ml={12}>
						{productModifierOptions?.map((option: any) => (
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
				{hideItemImageOnCheckOutPage ? null : (
					<Image
						src={productImage || "/food.jpg"}
						alt={productName}
						width={80}
						height={80}
						radius={8}
					/>
				)}
			</Flex>
		</CheckoutItemContainer>
	)
}

export default CheckoutItem
