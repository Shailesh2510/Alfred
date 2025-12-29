import { StyledTable } from "@/design-components"
import {
	ProductName,
	ProductPrice,
	ProductDetailContainer,
	ProductImage,
	ModifierContainer,
	ModifierOption
} from "./menu-items-table.style"
import { Flex } from "@mantine/core"
import { showPrice } from "@/shared-utils"
import { NoData } from "@/shared-components"
import { orderBy } from "lodash"

const MenuItemTable = ({ menuItems }: any) => {
	return (
		<>
			{menuItems?.length ? (
				<StyledTable highlightOnHover>
					<thead>
						<tr>
							<th>Name</th>
							<th>Modifiers</th>
							<th>Price</th>
							<th>Your price</th>
						</tr>
					</thead>
					<tbody>
						{orderBy(menuItems, "orderPosition").map((menuItem: any) => (
							<tr key={menuItem.itemId}>
								<td>
									<ProductDetailContainer>
										<ProductImage
											fit='cover'
											radius={4}
											width={40}
											height={40}
											src={menuItem?.imageUrl || "/food.jpg"}
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
								<td>
									<ProductPrice>{showPrice(menuItem.price)}</ProductPrice>
								</td>
								<td>
									{menuItem.newPrice ? showPrice(menuItem.newPrice) : "-"}
								</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			) : (
				<Flex mih={200} w='100%' justify='center' align='center'>
					<NoData message='No products found' />
				</Flex>
			)}
		</>
	)
}

export default MenuItemTable
