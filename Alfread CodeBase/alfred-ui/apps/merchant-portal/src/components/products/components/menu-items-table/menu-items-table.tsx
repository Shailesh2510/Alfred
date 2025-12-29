import React from "react"
import { StyledTable } from "@/design-components"
import {
	ProductName,
	ProductDetailContainer,
	ProductImage,
	ModifierContainer,
	ModifierOption
} from "./menu-items-table.style"
import { Flex, Button } from "@mantine/core"
import { showPrice } from "@/shared-utils"
import { NoData } from "@/shared-components"

const MenuItemTable = ({
	menuItems,
	onStockUpdate,
	loading,
	loadingItemId
}: any) => {
	const handleStockUpdate = (menuItem: any) => {
		onStockUpdate(menuItem)
	}

	return (
		<>
			{menuItems?.length ? (
				<StyledTable highlightOnHover>
					<thead>
						<tr>
							<th>Name</th>
							<th>Modifiers</th>
							<th>Price</th>
							<th>Stock status</th>
							<th>Manage Stock</th>
						</tr>
					</thead>
					<tbody>
						{menuItems.map((menuItem: any) => (
							<tr key={menuItem.id}>
								<td>
									<ProductDetailContainer>
										<ProductImage
											fit='cover'
											radius={4}
											width={40}
											height={40}
											src={menuItem?.imageUrl || "./food.jpg"}
										/>
										<ProductName>{menuItem.name}</ProductName>
									</ProductDetailContainer>
								</td>
								<td>
									{menuItem?.modifiers?.length
										? menuItem?.modifiers?.map((modifier: any) => (
												<ModifierContainer key={modifier?.id}>
													{modifier?.name}
													{modifier?.options?.map((modifierOption: any) => (
														<ModifierOption key={modifierOption?.id}>
															<div>- {modifierOption?.name}</div>
															<div>{showPrice(modifierOption?.price)}</div>
														</ModifierOption>
													))}
												</ModifierContainer>
										  ))
										: "-"}
								</td>
								<td>{showPrice(menuItem.price)}</td>
								<td>{menuItem?.outOfStockId ? "Out of stock" : "In Stock"}</td>
								<td>
									<Button
										size='sm'
										loading={loading && loadingItemId === menuItem.id}
										color={menuItem?.outOfStockId ? "green" : "red"}
										radius='sm'
										onClick={() => handleStockUpdate(menuItem)}
									>
										{menuItem?.outOfStockId
											? "Update status to 'IN STOCK'"
											: "Update status to 'OUT OF STOCK'"}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			) : (
				<Flex mih={400} w='100%' justify='center' align='center'>
					<NoData message='No products found' />
				</Flex>
			)}
		</>
	)
}

export default MenuItemTable
