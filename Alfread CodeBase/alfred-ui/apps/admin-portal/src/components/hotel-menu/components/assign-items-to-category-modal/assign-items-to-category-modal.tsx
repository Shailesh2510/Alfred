import React from "react"
import {
	StyledButton,
	StyledCheckbox,
	StyledDivider,
	StyledModal
} from "@/design-components"
import { Flex } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import useAssignItemsToCategory from "@/hooks/menu-item/useAssignItemsToCategory"
import { useState } from "react"
import useCategorizedMerchantProducts from "@/hooks/merchant-product/useCategorizedMerchantProducts"
import { filter, find, includes, map, uniqBy } from "lodash"
import { NoData } from "@/shared-components"
import { ProductImage } from "./assign-items-to-category-modal.style"

const AssignItemsToCategoryModal = ({
	menuId,
	refetchHotel,
	currentHotel,
	currentMerchantId,
	currentMealPeriodId,
	currentMenuCategory,
	assignItemsToCategoryModalOpen,
	setAssignItemsToCategoryModalOpen
}: any) => {
	const [selectedItemIds, setSelectedItemIds] = useState<any>([])

	const { data: categorizedMerchantProducts } = useCategorizedMerchantProducts(
		{ merchantId: currentMerchantId, menuId },
		{
			enabled: !!currentMerchantId && !!menuId
		}
	)

	const availableProducts =
		find(categorizedMerchantProducts?.data, {
			mealPeriodId: parseInt(currentMealPeriodId)
		})?.items || []

	const productsThatCanBeAssigned: any = filter(
		uniqBy(availableProducts, "id"),
		item =>
			!includes(map(currentMenuCategory?.items, "itemId"), (item as any)?.id)
	)

	const { mutate: assignMenuItemsToCategory } = useAssignItemsToCategory({
		onSuccess: () => {
			customNotification.success({
				title: "Assign items to category",
				message: "Items assigned to category successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Assign items to category",
				message: "Items failed to be assigned to category"
			})
		},
		onSettled: () => {
			refetchHotel()
			setSelectedItemIds([])
		}
	})

	const onClose = () => {
		setAssignItemsToCategoryModalOpen(false)
		setSelectedItemIds([])
	}

	return (
		<StyledModal
			opened={assignItemsToCategoryModalOpen}
			title='Assign items to menu category'
			onClose={onClose}
			modalBody={
				<>
					{productsThatCanBeAssigned?.length > 0 ? (
						<>
							{productsThatCanBeAssigned?.map((product: any) => (
								<React.Fragment key={product?.id}>
									<Flex justify='space-between' w='100%'>
										<Flex>
											<ProductImage
												fit='cover'
												radius={4}
												width={24}
												height={24}
												src={product?.imageUrl || "/food.jpg"}
											/>
											{product?.name}
										</Flex>
										<StyledCheckbox
											value={product?.id}
											checked={includes(selectedItemIds, product?.id)}
											onChange={() => {
												if (includes(selectedItemIds, product?.id)) {
													setSelectedItemIds((prevState: any) =>
														filter(prevState, value => value !== product?.id)
													)
												} else {
													setSelectedItemIds((prevState: any) => [
														...prevState,
														product.id
													])
												}
											}}
										/>
									</Flex>
									<StyledDivider p={0} my={8} color='gray.3' size='xs' />
								</React.Fragment>
							))}
						</>
					) : (
						<NoData message='No items to assign' />
					)}
				</>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={
							productsThatCanBeAssigned?.length === 0 ||
							selectedItemIds?.length === 0
						}
						onClick={() => {
							assignMenuItemsToCategory({
								menuId,
								hotelId: currentHotel?.id,
								itemIds: selectedItemIds,
								menuCategoryId: currentMenuCategory?.id
							})
							setAssignItemsToCategoryModalOpen(false)
						}}
					>
						Assign items
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AssignItemsToCategoryModal
