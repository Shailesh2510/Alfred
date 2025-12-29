import { Flex, Image, Tooltip } from "@mantine/core"
import { truncate } from "lodash"
import { showPrice } from "@/shared-utils"
import {
	ProductItemContainer,
	ProductItemName,
	ProductItemDescription,
	ProductItemPrice,
	ImageContainer
} from "./product-item.style"
import { StyledBadge, StyledButton } from "@/design-components"

const ProductItem = ({
	product,
	setSelectedProduct,
	setOrderItemModalOpen
}: any) => {
	const tags = product?.tags
		?.replace(/"|}|{/g, "")
		?.split(",")
		?.filter((tag: any) => tag)

	const handleItemClick = () => {
		setSelectedProduct(product)
		setOrderItemModalOpen(true)
	}

	return (
		<ProductItemContainer
			onClick={handleItemClick}
			style={{ cursor: "pointer" }}
		>
			<Flex
				direction={{ base: "row" }}
				justify={{ base: "center", lg: "space-between" }}
				gap={{ base: "md", lg: "lg" }}
				style={{ flex: 1 }}
			>
				<Flex
					direction='column'
					justify='space-between'
					align={{ base: "flex-start" }}
					style={{ flex: 1 }}
				>
					<Tooltip label={product?.name} radius={4} withArrow>
						<ProductItemName>
							{truncate(product?.name, { length: 56 })}
						</ProductItemName>
					</Tooltip>
					<Tooltip label={product?.description} radius={4} withArrow>
						<ProductItemDescription>
							{truncate(product?.description, { length: 80 })}
						</ProductItemDescription>
					</Tooltip>
					<Flex gap={8} my={16} wrap='wrap'>
						{tags?.length ? (
							<>
								{tags?.map((tag: any) => (
									<StyledBadge key={tag} color='gray.9' bg='gray.3'>
										{tag}
									</StyledBadge>
								))}
							</>
						) : null}
					</Flex>
					<ProductItemPrice>{showPrice(product?.price)}</ProductItemPrice>
				</Flex>
				<ImageContainer>
					<Image
						width={162}
						height={162}
						src={product?.imageUrl || "/food.jpg"}
						alt={product?.name}
						radius={8}
					/>
					<StyledButton
						color='dark.9'
						variant='outline'
						pos='absolute'
						top={4}
						right={4}
						onClick={handleItemClick}
					>
						Add
					</StyledButton>
				</ImageContainer>
			</Flex>
		</ProductItemContainer>
	)
}

export default ProductItem
