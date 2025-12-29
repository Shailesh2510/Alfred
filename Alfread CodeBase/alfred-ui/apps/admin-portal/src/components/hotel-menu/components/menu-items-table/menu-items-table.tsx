import {
	StyledButton,
	StyledNumberInput,
	StyledTable
} from "@/design-components"
import {
	ProductID,
	ProductName,
	ProductPrice,
	ProductDetailContainer,
	ProductImage
} from "./menu-items-table.style"
import { IconTrash, IconCurrencyDollar } from "@tabler/icons-react"
import { ActionIcon, Flex, Group } from "@mantine/core"
import { customNotification, showPrice } from "@/shared-utils"
import { isNumber, orderBy, toNumber } from "lodash"
import useDeleteMenuItem from "@/hooks/menu-item/useDeleteMenuItem"
import { useState } from "react"
import { useInputState } from "@mantine/hooks"
import useUpdateMenuItem from "@/hooks/menu-item/useUpdateMenuItem"
import { ICON_SIZE } from "@/shared-constants"
import { ConfirmDeleteModal, NoData } from "@/shared-components"

const MenuItemNewPrice = ({
	hotelId,
	menuItemId,
	currentNewPrice,
	refetchHotel
}: any) => {
	const [newPrice, setNewPrice] = useInputState(null)

	const { mutate: updateMenuItem } = useUpdateMenuItem({
		onSuccess: () => {
			customNotification.success({
				title: "Menu item price",
				message: "Menu item price updated successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Menu item price",
				message: "Updating menu item price failed"
			})
		},
		onSettled: () => {
			refetchHotel()
		}
	})

	return (
		<Group>
			<StyledNumberInput
				maw={200}
				precision={2}
				onChange={setNewPrice}
				icon={<IconCurrencyDollar color='black' />}
				value={currentNewPrice ? toNumber(currentNewPrice) : undefined}
			/>
			<StyledButton
				color='green'
				onClick={() => {
					if (menuItemId && hotelId && newPrice && isNumber(newPrice)) {
						updateMenuItem({ menuItemId, hotelId, newPrice })
					}
				}}
			>
				Save
			</StyledButton>
		</Group>
	)
}

const MenuItemTable = ({ hotelId, menuItems, refetchHotel }: any) => {
	const [menuItemToDelete, setMenuItemToDelete] = useState<any>(null)
	const [showDeleteMenuItemModalOpen, setShowDeleteMenuItemModalOpen] =
		useState<boolean>(false)

	const { mutate: deleteMenuItem } = useDeleteMenuItem({
		onSuccess: () => {
			customNotification.success({
				title: "Remove menu item",
				message: "Menu item removed successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Remove menu item",
				message: "Removing menu item failed"
			})
		},
		onSettled: () => {
			refetchHotel()
			setMenuItemToDelete(null)
			setShowDeleteMenuItemModalOpen(false)
		}
	})

	return (
		<>
			{menuItems?.length ? (
				<StyledTable highlightOnHover>
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Price</th>
							<th>Your price</th>
							<th></th>
						</tr>
					</thead>
					<tbody id='sortable-table'>
						{orderBy(menuItems, "orderPosition").map((menuItem: any) => (
							<tr
								key={menuItem?.itemId}
								data-menu-item-id={menuItem?.menuItemId}
								data-menu-category-id={menuItem?.menuCategoryId}
							>
								<td>
									<ProductID>#{menuItem.itemId}</ProductID>
								</td>
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
									<ProductPrice>{showPrice(menuItem.price)}</ProductPrice>
								</td>
								<td>
									<MenuItemNewPrice
										hotelId={hotelId}
										refetchHotel={refetchHotel}
										menuItemId={menuItem?.menuItemId}
										currentNewPrice={menuItem?.newPrice}
									/>
								</td>
								<td>
									<Flex columnGap={12} justify='flex-end'>
										<ActionIcon>
											<IconTrash
												size={ICON_SIZE}
												color='black'
												onClick={() => {
													setMenuItemToDelete(menuItem)
													setShowDeleteMenuItemModalOpen(true)
												}}
											/>
										</ActionIcon>
									</Flex>
								</td>
							</tr>
						))}
					</tbody>
					<ConfirmDeleteModal
						title='Delete menu item'
						message={
							<>
								Are you sure you want to remove `<b>{menuItemToDelete?.name}</b>
								` from the menu?
							</>
						}
						modalOpen={showDeleteMenuItemModalOpen}
						setModalOpen={setShowDeleteMenuItemModalOpen}
						onClose={() => setMenuItemToDelete(null)}
						onDelete={() => {
							if (menuItemToDelete?.itemId && hotelId) {
								deleteMenuItem({
									menuItemId: menuItemToDelete?.menuItemId,
									hotelId
								})
							}
						}}
					/>
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
