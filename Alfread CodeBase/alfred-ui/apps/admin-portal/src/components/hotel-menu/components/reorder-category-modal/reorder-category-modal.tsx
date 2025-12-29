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
import {
	CategoryItem,
	CategoriesContainer
} from "./reorder-category-modal.style"
import { IconGripVertical } from "@tabler/icons-react"
import { filter, orderBy } from "lodash"
import { customNotification } from "@/shared-utils"
import useReOrderMenuCategories from "@/hooks/menu-category/useReOrderMenuCategories"

type ReOrderCategoryModalProps = {
	menuCategories: any
	mealPeriodId: number
	setOrderCategoryModalOpen: (value: boolean) => void
	orderCategoryModalOpen: boolean
	refetchMenuCategories: any
}

const ReOrderCategoryModal = ({
	menuCategories,
	mealPeriodId,
	setOrderCategoryModalOpen,
	orderCategoryModalOpen,
	refetchMenuCategories
}: ReOrderCategoryModalProps) => {
	const [categories, setCategories] = useState<any>([])

	useEffect(() => {
		const currentMenuCategories: any = orderBy(
			filter(menuCategories?.data, {
				mealPeriodId: mealPeriodId
			}),
			[item => item.orderPosition ?? item.id]
		)

		setCategories(currentMenuCategories)
	}, [menuCategories, mealPeriodId])

	const handleDragEnd = (result: DropResult) => {
		const { source, destination } = result

		if (!destination || source.index === destination.index) {
			return
		}

		const newCategories = Array.from(categories)
		const [reorderedItem] = newCategories.splice(source.index, 1)
		newCategories.splice(destination.index, 0, reorderedItem)

		setCategories(newCategories)
	}

	const { mutate: reOrderMenuCategories } = useReOrderMenuCategories({
		onSuccess: (response: boolean) => {
			if (response) {
				customNotification.success({
					message: `Category order positions are updated successfully.`
				})
				setOrderCategoryModalOpen(false)
				refetchMenuCategories()
			} else {
				customNotification.error({
					message: `Failed to update category order positions. Please try again.`
				})
			}
		}
	})

	const handleReOrderSubmit = (categories: any) => {
		const transformedCategories = categories.map(
			(category: any, index: any) => ({
				menuCategoryId: category.id,
				orderPosition: index + 1
			})
		)
		reOrderMenuCategories({ categories: transformedCategories })
	}

	return (
		<StyledModal
			size='lg'
			opened={orderCategoryModalOpen}
			title={`Set Category Order`}
			onClose={() => setOrderCategoryModalOpen(false)}
			styles={{
				content: { overflowX: "hidden", width: "100%" }
			}}
			modalBody={
				<Flex direction='column'>
					{categories?.length ? (
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId='category-order' direction='vertical'>
								{provided => (
									<CategoriesContainer
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										{categories?.map((category: any, index: number) => (
											<Draggable
												key={category.id}
												index={index}
												draggableId={category.id.toString()}
											>
												{provided => (
													<CategoryItem
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
													>
														<IconGripVertical
															size={18}
															stroke={1.5}
															style={{ marginRight: 12 }}
														/>
														<Text>{category.name}</Text>
													</CategoryItem>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</CategoriesContainer>
								)}
							</Droppable>
						</DragDropContext>
					) : (
						<NoData message='No categories found' minHeight={200} />
					)}
				</Flex>
			}
			modalFooter={
				<Flex justify='flex-end' gap='md'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setOrderCategoryModalOpen(false)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!categories?.length}
						color='green'
						onClick={() => {
							handleReOrderSubmit(categories)
						}}
					>
						Confirm
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default ReOrderCategoryModal
