import { Flex, Loader, Tabs, Accordion, Badge, Button } from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { find, map, orderBy, size } from "lodash"
import { useInputState, useMediaQuery } from "@mantine/hooks"
import MenuItemTable from "./components/menu-items-table"
import { PageStructure } from "@/shared-components"
import useMealPeriods from "@/hooks/meal-period/useMealPeriods"
import {
	StyledTab,
	StyledTabs,
	MenuTabContainer,
	MenuTitle,
	MenuTime,
	MenuPageContainer,
	MobileMenuCard,
	MobileMenuImage,
	MobileMenuContent,
	MobileMenuActions,
	AccordionStyled,
	MobileMenuItemName,
	MobileMenuItemPrice
} from "./products.style"
import useCategorizedProducts from "@/hooks/product/useCategorizedProducts"
import {
	getMealPeriodWorkingHours,
	showPrice,
	customNotification
} from "@/shared-utils"
import useCurrentMerchant from "@/hooks/me/useCurrentMerchant"
import useUpdateProductStock from "@/hooks/stock/useUpdateProductStock"
import { useQueryClient } from "@tanstack/react-query"
const Products = () => {
	const [currentMealPeriodId, setCurrentMealPeriodId] = useInputState("")
	const [itemId, setItemId] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const isMobile = useMediaQuery("(max-width: 768px)")
	const queryClient = useQueryClient()
	const { data: currentMerchant, isLoading: currentMerchantLoading } =
		useCurrentMerchant()
	const { data: mealPeriods, isLoading: mealPeriodsLoading } = useMealPeriods()
	const {
		data: categorizedProducts,
		isLoading: categorizedProductsLoading,
		refetch: refetchCategorizedProducts
	} = useCategorizedProducts()

	const { mutate: updateProductStock } = useUpdateProductStock({
		onSuccess: async () => {
			try {
				await Promise.all([
					queryClient.invalidateQueries([
						"menuItems",
						currentMerchant?.data?.[0]?.id
					]),
					refetchCategorizedProducts()
				])

				customNotification.success({
					title: "Product stock",
					message: "Product stock updated successfully"
				})
			} catch (error) {
				customNotification.error({
					title: "Product stock",
					message: "Failed to refresh product data"
				})
			} finally {
				setItemId(null)
				setLoading(false)
			}
		},
		onError: () => {
			customNotification.error({
				title: "Product stock",
				message: "Product stock failed to update"
			})
			setItemId(null)
			setLoading(false)
		}
	})

	const orderedMealPeriods = useMemo(
		() => orderBy(mealPeriods?.data, "startHour"),
		[mealPeriods?.data]
	)

	useEffect(() => {
		const firstMealPeriod = orderedMealPeriods?.[0]
		if (!currentMealPeriodId && firstMealPeriod) {
			setCurrentMealPeriodId(firstMealPeriod?.id?.toString())
		}
	}, [currentMealPeriodId, orderedMealPeriods])

	const productsToShow =
		find(categorizedProducts?.data, {
			mealPeriodId: parseInt(currentMealPeriodId)
		})?.items || []

	const handleRefresh = () => {
		refetchCategorizedProducts()
	}
	const handleStockUpdate = (menuItem: any) => {
		if (!menuItem || !currentMerchant) {
			return
		}
		setLoading(true)
		setItemId(menuItem.id)
		const payload = {
			merchantId: currentMerchant?.data?.[0]?.id,
			itemId: menuItem.id,
			out: menuItem?.outOfStockId ? "false" : "true"
		}
		updateProductStock(payload)
	}

	const renderMobileProductCard = (menuItem: any) => (
		<MobileMenuCard key={menuItem.id}>
			<MobileMenuImage>
				<img src={menuItem?.imageUrl || "./food.jpg"} alt={menuItem.name} />
			</MobileMenuImage>
			<MobileMenuContent>
				<div>
					<MobileMenuItemName>{menuItem.name}</MobileMenuItemName>
					<MobileMenuItemPrice>{showPrice(menuItem.price)}</MobileMenuItemPrice>
					<Badge color={menuItem?.outOfStockId ? "red" : "green"}>
						{menuItem?.outOfStockId ? "Out of stock" : "In Stock"}
					</Badge>
				</div>
				<MobileMenuActions>
					<Button
						size='sm'
						loading={loading && itemId === menuItem.id}
						color={menuItem?.outOfStockId ? "green" : "red"}
						radius='sm'
						onClick={() => {
							handleStockUpdate(menuItem)
						}}
					>
						{menuItem?.outOfStockId ? "Mark In Stock" : "Mark Out of Stock"}
					</Button>
				</MobileMenuActions>
			</MobileMenuContent>
		</MobileMenuCard>
	)

	const renderMobileView = () => (
		<AccordionStyled>
			{map(orderedMealPeriods, mealPeriod => {
				const products =
					find(categorizedProducts?.data, {
						mealPeriodId: parseInt(mealPeriod.id)
					})?.items || []

				const { mealPeriodStartTimeString, mealPeriodEndTimeString } =
					getMealPeriodWorkingHours({
						startHour: mealPeriod?.startHour,
						endHour: mealPeriod?.endHour,
						timezone: mealPeriod?.timezone
					})

				return (
					<Accordion.Item key={mealPeriod.id} value={mealPeriod.id.toString()}>
						<Accordion.Control>
							<MenuTabContainer>
								<MenuTitle>{mealPeriod?.name}</MenuTitle>
								<MenuTime>{`${mealPeriodStartTimeString} - ${mealPeriodEndTimeString}`}</MenuTime>
							</MenuTabContainer>
						</Accordion.Control>
						<Accordion.Panel>
							{products.length ? (
								<div>
									{map(products, menuItem => renderMobileProductCard(menuItem))}
								</div>
							) : (
								<Flex mih={100} w='100%' justify='center' align='center'>
									<div>No products available</div>
								</Flex>
							)}
						</Accordion.Panel>
					</Accordion.Item>
				)
			})}
		</AccordionStyled>
	)

	const renderDesktopView = () => (
		<MenuPageContainer>
			<StyledTabs
				radius={4}
				value={currentMealPeriodId}
				variant='outline'
				onTabChange={setCurrentMealPeriodId}
			>
				<Tabs.List>
					{size(orderedMealPeriods) && (
						<>
							{map(orderedMealPeriods, mealPeriod => {
								const { mealPeriodStartTimeString, mealPeriodEndTimeString } =
									getMealPeriodWorkingHours({
										startHour: mealPeriod?.startHour,
										endHour: mealPeriod?.endHour,
										timezone: mealPeriod?.timezone
									})
								return (
									<StyledTab
										key={mealPeriod?.id?.toString()}
										value={mealPeriod?.id?.toString()}
									>
										<MenuTabContainer>
											<MenuTitle>{mealPeriod?.name}</MenuTitle>
											<MenuTime>{`${mealPeriodStartTimeString} -  ${mealPeriodEndTimeString}`}</MenuTime>
										</MenuTabContainer>
									</StyledTab>
								)
							})}
						</>
					)}
				</Tabs.List>
				{size(orderedMealPeriods) ? (
					<>
						{map(orderedMealPeriods, mealPeriod => (
							<Tabs.Panel
								key={mealPeriod?.id?.toString()}
								value={mealPeriod?.id?.toString()}
							>
								<MenuItemTable
									menuItems={map(productsToShow, product => ({
										price: product?.price,
										id: product?.id,
										name: product?.name,
										newPrice: product?.newPrice,
										modifiers: product?.modifiers,
										imageUrl: product?.imageUrl,
										outOfStockId: product?.outOfStockId
									}))}
									merchantId={currentMerchant?.data?.[0]?.id}
									onRefresh={handleRefresh}
									onStockUpdate={handleStockUpdate}
									loading={loading}
									loadingItemId={itemId}
								/>
							</Tabs.Panel>
						))}
					</>
				) : null}
			</StyledTabs>
		</MenuPageContainer>
	)

	return (
		<PageStructure
			goBack
			title='Products'
			pageContent={
				<>
					{categorizedProductsLoading ||
					mealPeriodsLoading ||
					currentMerchantLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>{isMobile ? renderMobileView() : renderDesktopView()}</>
					)}
				</>
			}
		/>
	)
}

export default Products
