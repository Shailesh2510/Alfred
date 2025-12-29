import { StyledDivider } from "@/design-components"
import { MealPeriodTitle } from "./hotel-menu.style"
import { Flex, Grid, Skeleton } from "@mantine/core"
import ProductItem from "../product-item"
import OrderItemModal from "../order-item-modal/order-item-modal"
import React, { useState } from "react"
import { groupBy, map, size } from "lodash"
import { getMealPeriodWorkingHours } from "@/shared-utils"
import { NoData } from "@/shared-components"
import useGlobalStore from "@/globalStore/globalStore"

const HotelMenu = ({
	currentMealPeriodItems,
	categoryRefs,
	setOrderItemModalOpen,
	orderItemModalOpen
}: any) => {
	const [selectedProduct, setSelectedProduct] = useState(false)
	const { currentHotelDetails } = useGlobalStore()

	if (!currentMealPeriodItems) {
		return <Skeleton height={400} animate={true} />
	}

	if (size(currentMealPeriodItems) === 0) {
		return <NoData message='No products found' minHeight={600} />
	}

	const { mealPeriodStartTimeString, mealPeriodEndTimeString } =
		getMealPeriodWorkingHours({
			timezone: currentHotelDetails?.timezone,
			startHour: currentMealPeriodItems?.[0].mealPeriodStartHour,
			endHour: currentMealPeriodItems?.[0].mealPeriodEndHour
		})

	const groupedCategories = groupBy(
		currentMealPeriodItems,
		item => item.menuCategoryPosition ?? item.menuCategoryId
	)

	const sortedGroupedCategories = Object.fromEntries(
		Object.entries(groupedCategories).map(([key, items]) => [
			key,
			items.sort((a, b) => a.orderPosition - b.orderPosition)
		])
	)

	return (
		<>
			<Flex direction='column'>
				<MealPeriodTitle>
					<b>{currentMealPeriodItems?.[0]?.mealPeriodName}</b>
					{`(served from ${mealPeriodStartTimeString} to ${mealPeriodEndTimeString}) `}
				</MealPeriodTitle>
				<Flex direction='column' rowGap={24} my={16}>
					{map(sortedGroupedCategories, mealPeriodCategories => (
						<React.Fragment key={mealPeriodCategories?.[0]?.menuCategoryId}>
							<div
								ref={
									categoryRefs.current[
										mealPeriodCategories?.[0]?.menuCategoryName
									]
								}
								data-category={mealPeriodCategories?.[0]?.menuCategoryName}
							>
								<StyledDivider
									label={mealPeriodCategories?.[0]?.menuCategoryName}
									font='md700'
								/>
							</div>
							<Grid>
								{map(mealPeriodCategories, mealPeriodCategory => (
									<Grid.Col xs={12} xl={6} key={mealPeriodCategory?.itemId}>
										<ProductItem
											product={{
												id: mealPeriodCategory?.itemId,
												tags: mealPeriodCategory?.tags,
												name: mealPeriodCategory?.itemName,
												price: mealPeriodCategory?.price,
												modifiers: mealPeriodCategory?.modifiers,
												description: mealPeriodCategory?.description,
												imageUrl: mealPeriodCategory?.imageUrl,
												mealPeriodId: mealPeriodCategory?.mealPeriodId
											}}
											setSelectedProduct={setSelectedProduct}
											setOrderItemModalOpen={setOrderItemModalOpen}
										/>
									</Grid.Col>
								))}
							</Grid>
						</React.Fragment>
					))}
				</Flex>
			</Flex>
			<OrderItemModal
				product={selectedProduct}
				orderItemModalOpen={orderItemModalOpen}
				setOrderItemModalOpen={setOrderItemModalOpen}
			/>
		</>
	)
}

export default HotelMenu
