/* eslint-disable no-unused-vars */
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult
} from "@hello-pangea/dnd"
import { StyledButton, StyledModal } from "@/design-components"
import { Flex, Text } from "@mantine/core"
import React, { useEffect, useState } from "react"
import { NoData } from "@/shared-components"

import { IconGripVertical } from "@tabler/icons-react"
import { orderBy } from "lodash"
import { customNotification } from "@/shared-utils"
import useReOrderMenuItems from "@/hooks/menu-category/useReOrderMenuItems"
import { MenuItem, MenuItemsContainer } from "./reorder-category-modal.style"

type ReOrderCategoryItemsModalProps = {
	menuItems: any
	mealPeriodId: number
	setReorderCategoryItemsModalOpen: (value: boolean) => void
	reorderCategoryItemsModalOpen: boolean
	refetchHotel: any
}

const ReOrderCategoryItemsModal = ({
	menuItems,
	mealPeriodId,
	setReorderCategoryItemsModalOpen,
	reorderCategoryItemsModalOpen,
	refetchHotel
}: ReOrderCategoryItemsModalProps) => {
	const [listOfMenuItems, setListofMenuItems] = useState<any>([])

	useEffect(() => {
		const sortedMenuItems = orderBy(menuItems, [
			item => item.orderPosition ?? item.menuItemId
		])
		setListofMenuItems(sortedMenuItems)
	}, [menuItems, mealPeriodId])

	const handleDragEnd = (result: DropResult) => {
		const { source, destination } = result

		if (!destination || source.index === destination.index) {
			return
		}

		const newCategorieItems = Array.from(listOfMenuItems)
		const [reorderedItem] = newCategorieItems.splice(source.index, 1)
		newCategorieItems.splice(destination.index, 0, reorderedItem)

		setListofMenuItems(newCategorieItems)
	}

	const { mutate: reOrderMenuItems } = useReOrderMenuItems({
		onSuccess: (response: boolean) => {
			if (response) {
				customNotification.success({
					message: `Menu Item positions are updated successfully.`
				})
				setReorderCategoryItemsModalOpen(false)
				refetchHotel()
			} else {
				customNotification.error({
					message: `Failed to update menu item order positions. Please try again.`
				})
			}
		}
	})

	const handleReOrderSubmit = (menuItems: any) => {
		const transformedMenuItems = menuItems.map((menuItem: any, index: any) => ({
			menuItemId: menuItem.menuItemId,
			orderPosition: index + 1
		}))
		reOrderMenuItems({ menuItems: transformedMenuItems })
	}

	return (
		<StyledModal
			size='lg'
			opened={reorderCategoryItemsModalOpen}
			title={`Set Category Item Order`}
			onClose={() => setReorderCategoryItemsModalOpen(false)}
			styles={{
				content: { overflowX: "hidden", width: "100%" }
			}}
			modalBody={
				<Flex direction='column'>
					{listOfMenuItems?.length ? (
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId='menu-items-order' direction='vertical'>
								{provided => (
									<MenuItemsContainer
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										{listOfMenuItems?.map(
											(categoryItem: any, index: number) => (
												<Draggable
													key={categoryItem.menuItemId}
													index={index}
													draggableId={categoryItem.menuItemId.toString()}
												>
													{provided => (
														<MenuItem
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
														>
															<IconGripVertical
																size={18}
																stroke={1.5}
																style={{ marginRight: 12 }}
															/>
															<Text>{categoryItem.itemName}</Text>
														</MenuItem>
													)}
												</Draggable>
											)
										)}
										{provided.placeholder}
									</MenuItemsContainer>
								)}
							</Droppable>
						</DragDropContext>
					) : (
						<NoData message='No menu items found' minHeight={200} />
					)}
				</Flex>
			}
			modalFooter={
				<Flex justify='flex-end' gap='md'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setReorderCategoryItemsModalOpen(false)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!listOfMenuItems?.length}
						color='green'
						onClick={() => {
							handleReOrderSubmit(listOfMenuItems)
						}}
					>
						Confirm
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default ReOrderCategoryItemsModal
