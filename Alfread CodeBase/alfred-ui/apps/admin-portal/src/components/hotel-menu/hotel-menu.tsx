import {
	Accordion,
	ActionIcon,
	Divider,
	Flex,
	Loader,
	Tabs
} from "@mantine/core"
import {
	IconArticle,
	IconCircleChevronDown,
	IconEdit,
	IconPlus,
	IconReorder,
	IconTrash
} from "@tabler/icons-react"
import { StyledButton } from "@/design-components"
import AddCategoryModal from "./components/add-category-modal"
import ReOrderCategoryModal from "./components/reorder-category-modal"
import { useEffect, useMemo, useState } from "react"
import { filter, groupBy, map, orderBy, size } from "lodash"
import { customNotification, getMealPeriodWorkingHours } from "@/shared-utils"
import { useInputState } from "@mantine/hooks"
import RenameCategoryModal from "./components/rename-category-modal"
import MenuItemTable from "./components/menu-items-table"
import { ConfirmDeleteModal, NoData, PageStructure } from "@/shared-components"
import { useRouter } from "next/router"
import useHotel from "@/hooks/hotel/useHotel"
import HotelDetailsMenu from "../shared/hotel-details-menu"
import { ICON_SIZE } from "@/shared-constants"
import PublishMenuModal from "./components/publish-menu-modal"
import AssignItemsToCategoryModal from "./components/assign-items-to-category-modal"
import useDeleteMenuCategory from "@/hooks/menu-category/useDeleteMenuCategory"
import useHotelMealPeriods from "@/hooks/meal-period/useHotelMealPeriods"
import useMenuCategories from "@/hooks/menu-category/useMenuCategories"
import ReplicateMenuModal from "./components/replicate-menu-modal"
import {
	StyledTab,
	StyledTabs,
	MenuTabContainer,
	MenuTitle,
	MenuTime,
	MenuPageContainer,
	RestaurantTitle,
	RestaurantID,
	StyledAccordion,
	AddCategoryContainer
} from "./hotel-menu.style"
import ReOrderCategoryItemsModal from "./components/reorder-category-items-modal"

const HotelMenu = () => {
	const router = useRouter()

	const hotelId = router.query.id

	const [currentMerchantId, setCurrentMerchantId] = useState<any>(null)
	const [currentMealPeriodId, setCurrentMealPeriodId] = useInputState("")
	const [currentMenuCategory, setCurrentMenuCategory] = useState<any>(null)
	const [menuCategoryToDelete, setMenuCategoryToDelete] = useState<any>(null)
	const [activeMenuCategories, setActiveMenuCategories] = useState<string[]>([])
	const [addCategoryModalOpen, setAddCategoryModalOpen] =
		useState<boolean>(false)
	const [orderCategoryModalOpen, setOrderCategoryModalOpen] =
		useState<boolean>(false)
	const [publishMenuModalOpen, setPublishMenuModalOpen] =
		useState<boolean>(false)
	const [replicateMenuModalOpen, setReplicateMenuModalOpen] = useState(false)
	const [renameCategoryModalOpen, setRenameCategoryModalOpen] =
		useState<boolean>(false)
	const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] =
		useState<boolean>(false)
	const [assignItemsToCategoryModalOpen, setAssignItemsToCategoryModalOpen] =
		useState<boolean>(false)
	const [reorderCategoryItemsModalOpen, setReorderCategoryItemsModalOpen] =
		useState<boolean>(false)

	const {
		data: hotel,
		isLoading: hotelLoading,
		refetch: refetchHotel
	} = useHotel(
		{ hotelId },
		{
			enabled: !!hotelId
		}
	)

	const currentHotel = hotel?.data?.[0]
	const menu = currentHotel?.menu
	const menuId = currentHotel?.menuId

	const { data: hotelMealPeriods, isLoading: hotelMealPeriodsLoading } =
		useHotelMealPeriods(
			{ hotelId },
			{
				enabled: !!hotelId,
				retry: 1
			}
		)

	const {
		data: menuCategories,
		isLoading: menuCategoriesLoading,
		refetch: refetchMenuCategories
	} = useMenuCategories(
		{ menuId: menuId },
		{
			enabled: !!menuId
		}
	)

	const groupedMenu = useMemo(() => groupBy(menu, "menuCategoryId"), [menu])
	const orderedMealPeriods = useMemo(
		() => orderBy(hotelMealPeriods?.data, "startHour"),
		[hotelMealPeriods?.data]
	)
	const currentMenuCategories: any = useMemo(
		() =>
			orderBy(
				filter(menuCategories?.data, {
					mealPeriodId: parseInt(currentMealPeriodId)
				}),
				[item => item.orderPosition ?? item.id]
			) || [],
		[menuCategories?.data, currentMealPeriodId]
	)

	useEffect(() => {
		const firstMealPeriod = orderedMealPeriods?.[0]
		if (!currentMealPeriodId && firstMealPeriod) {
			setCurrentMealPeriodId(firstMealPeriod?.id?.toString())
			setCurrentMerchantId(firstMealPeriod?.merchantId)
		}
	}, [currentMealPeriodId, orderedMealPeriods])

	useEffect(() => {
		if (currentMenuCategories?.length) {
			setActiveMenuCategories(
				map(currentMenuCategories, menuCategory => menuCategory?.id?.toString())
			)
		}
	}, [currentMenuCategories])

	const merchantIds = useMemo(() => {
		return (
			orderedMealPeriods?.map(mealPeriod => parseInt(mealPeriod.merchantId)) ||
			[]
		)
	}, [orderedMealPeriods])

	const { mutate: deleteMenuCategory } = useDeleteMenuCategory({
		onSuccess: () => {
			customNotification.success({
				title: "Delete menu category",
				message: "Menu category deleted successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Delete menu category",
				message: "Menu category failed to be deleted"
			})
		},
		onSettled: () => {
			refetchMenuCategories()
			setMenuCategoryToDelete(null)
		}
	})

	return (
		<PageStructure
			goBack
			title={currentHotel?.name ? `${currentHotel?.name} - Menu` : null}
			subHeaderContent={
				<Flex w='100%' justify='space-between'>
					<HotelDetailsMenu hotelId={hotelId} />
					<Flex>
						<StyledButton
							ml={16}
							variant='outline'
							color='dark'
							disabled={!menuId}
							leftIcon={<IconReorder size={ICON_SIZE} color='black' />}
							onClick={() => setOrderCategoryModalOpen(true)}
						>
							Set Category Order
						</StyledButton>

						<StyledButton
							ml={16}
							variant='outline'
							color='dark'
							disabled={!menuId}
							leftIcon={<IconArticle size={ICON_SIZE} color='black' />}
							onClick={() => setReplicateMenuModalOpen(true)}
						>
							Replicate Menu
						</StyledButton>
						<StyledButton
							ml={24}
							variant='outline'
							color='dark'
							disabled={orderedMealPeriods.length === 0}
							leftIcon={<IconArticle size={ICON_SIZE} color='black' />}
							onClick={() => setPublishMenuModalOpen(true)}
						>
							Publish Menu
						</StyledButton>
					</Flex>
				</Flex>
			}
			pageContent={
				<>
					{hotelLoading || menuCategoriesLoading || hotelMealPeriodsLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{hotelMealPeriods?.data?.length ? (
								<>
									{currentMealPeriodId && (
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
																const {
																	mealPeriodStartTimeString,
																	mealPeriodEndTimeString
																} = getMealPeriodWorkingHours({
																	timezone: mealPeriod?.timezone,
																	startHour: mealPeriod?.startHour,
																	endHour: mealPeriod?.endHour
																})

																return (
																	<StyledTab
																		key={mealPeriod?.id?.toString()}
																		value={mealPeriod?.id?.toString()}
																		onClick={() => {
																			setCurrentMerchantId(
																				mealPeriod.merchantId
																			)
																		}}
																	>
																		<MenuTabContainer>
																			<MenuTitle>{mealPeriod?.name}</MenuTitle>
																			<MenuTime>{`${mealPeriodStartTimeString} - ${mealPeriodEndTimeString}`}</MenuTime>
																		</MenuTabContainer>
																		<Divider color='gray.5' mt={16} mb={16} />
																		<Flex direction='column'>
																			<RestaurantTitle>
																				{mealPeriod.merchantName}
																			</RestaurantTitle>
																			<RestaurantID>
																				#{mealPeriod.merchantId}
																			</RestaurantID>
																		</Flex>
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
																{currentMenuCategories?.length ? (
																	<>
																		{map(
																			currentMenuCategories,
																			menuCategory => (
																				<StyledAccordion
																					multiple
																					key={menuCategory?.id}
																					value={activeMenuCategories}
																					onChange={setActiveMenuCategories}
																					chevron={
																						<IconCircleChevronDown
																							size={ICON_SIZE}
																						/>
																					}
																				>
																					<Accordion.Item
																						value={menuCategory?.id?.toString()}
																					>
																						<Accordion.Control>
																							<Flex
																								align='center'
																								justify='space-between'
																								w='100%'
																							>
																								<Flex align='center'>
																									{menuCategory?.name}
																									<StyledButton
																										ml={24}
																										variant='outline'
																										color='dark'
																										leftIcon={
																											<IconEdit
																												size={ICON_SIZE}
																												color='black'
																											/>
																										}
																										onClick={(event: any) => {
																											event.preventDefault()
																											event.stopPropagation()
																											setRenameCategoryModalOpen(
																												true
																											)
																											setCurrentMenuCategory({
																												id: menuCategory?.id,
																												name: menuCategory?.name,
																												items:
																													groupedMenu?.[
																														menuCategory?.id
																													]
																											})
																										}}
																									>
																										Edit
																									</StyledButton>
																									<StyledButton
																										ml={24}
																										variant='outline'
																										color='dark'
																										leftIcon={
																											<IconPlus
																												size={ICON_SIZE}
																												color='black'
																											/>
																										}
																										onClick={(event: any) => {
																											event.preventDefault()
																											event.stopPropagation()
																											setAssignItemsToCategoryModalOpen(
																												true
																											)
																											setCurrentMenuCategory({
																												id: menuCategory?.id,
																												name: menuCategory?.name,
																												items:
																													groupedMenu?.[
																														menuCategory?.id
																													]
																											})
																										}}
																									>
																										Add items
																									</StyledButton>
																									<StyledButton
																										ml={24}
																										variant='outline'
																										color='dark'
																										leftIcon={
																											<IconReorder
																												size={ICON_SIZE}
																												color='black'
																											/>
																										}
																										onClick={(event: any) => {
																											event.preventDefault()
																											event.stopPropagation()
																											setReorderCategoryItemsModalOpen(
																												true
																											)
																											setCurrentMenuCategory({
																												id: menuCategory?.id,
																												name: menuCategory?.name,
																												items:
																													groupedMenu?.[
																														menuCategory?.id
																													]
																											})
																										}}
																									>
																										{`Set ${menuCategory?.name} Item Order`}
																									</StyledButton>
																								</Flex>
																								<ActionIcon>
																									<IconTrash
																										size={ICON_SIZE}
																										color='black'
																										onClick={(event: any) => {
																											event.preventDefault()
																											event.stopPropagation()
																											setMenuCategoryToDelete({
																												id: menuCategory?.id,
																												name: menuCategory?.name,
																												items:
																													groupedMenu?.[
																														menuCategory?.id
																													]
																											})
																											setDeleteCategoryModalOpen(
																												true
																											)
																										}}
																									/>
																								</ActionIcon>
																							</Flex>
																						</Accordion.Control>
																						<Accordion.Panel>
																							<MenuItemTable
																								hotelId={hotelId}
																								showPriceInput
																								refetchHotel={refetchHotel}
																								menuItems={map(
																									groupedMenu?.[
																										menuCategory?.id
																									],
																									menuCategoryItem => ({
																										menuCategoryId:
																											menuCategory?.id,
																										price:
																											menuCategoryItem?.price,
																										itemId:
																											menuCategoryItem?.itemId,
																										name: menuCategoryItem?.itemName,
																										newPrice:
																											menuCategoryItem?.newPrice,
																										menuItemId:
																											menuCategoryItem?.menuItemId,
																										imageUrl:
																											menuCategoryItem?.imageUrl,
																										orderPosition:
																											menuCategoryItem?.orderPosition
																									})
																								)}
																							/>
																						</Accordion.Panel>
																					</Accordion.Item>
																				</StyledAccordion>
																			)
																		)}
																	</>
																) : null}
															</Tabs.Panel>
														))}
													</>
												) : null}
											</StyledTabs>
											<AddCategoryContainer>
												<StyledButton
													variant='outline'
													color='dark.5'
													leftIcon={<IconPlus />}
													onClick={() => setAddCategoryModalOpen(true)}
												>
													Add Category
												</StyledButton>
											</AddCategoryContainer>
										</MenuPageContainer>
									)}
									<AddCategoryModal
										menuId={menuId}
										hotelId={hotelId}
										refetchMenuCategories={refetchMenuCategories}
										mealPeriodId={parseInt(currentMealPeriodId)}
										addCategoryModalOpen={addCategoryModalOpen}
										setAddCategoryModalOpen={setAddCategoryModalOpen}
									/>
									{orderCategoryModalOpen && (
										<ReOrderCategoryModal
											menuCategories={menuCategories}
											mealPeriodId={parseInt(currentMealPeriodId)}
											setOrderCategoryModalOpen={setOrderCategoryModalOpen}
											orderCategoryModalOpen={orderCategoryModalOpen}
											refetchMenuCategories={refetchMenuCategories}
										/>
									)}
									<RenameCategoryModal
										hotelId={hotelId}
										menuCategoryId={currentMenuCategory?.id}
										menuCategoryName={currentMenuCategory?.name}
										refetchMenuCategories={refetchMenuCategories}
										renameCategoryModalOpen={renameCategoryModalOpen}
										setRenameCategoryModalOpen={setRenameCategoryModalOpen}
									/>
									<PublishMenuModal
										menuId={menuId}
										refetchHotel={refetchHotel}
										currentHotel={currentHotel}
										publishMenuModalOpen={publishMenuModalOpen}
										setPublishMenuModalOpen={setPublishMenuModalOpen}
									/>
									<ReplicateMenuModal
										currentHotelId={hotelId}
										currentHotelName={currentHotel?.name}
										merchantIds={merchantIds}
										replicateMenuModalOpen={replicateMenuModalOpen}
										setReplicateMenuModalOpen={setReplicateMenuModalOpen}
									/>

									<AssignItemsToCategoryModal
										menuId={menuId}
										refetchHotel={refetchHotel}
										currentHotel={currentHotel}
										currentMerchantId={currentMerchantId}
										currentMealPeriodId={currentMealPeriodId}
										currentMenuCategory={currentMenuCategory}
										assignItemsToCategoryModalOpen={
											assignItemsToCategoryModalOpen
										}
										setAssignItemsToCategoryModalOpen={
											setAssignItemsToCategoryModalOpen
										}
									/>
									{reorderCategoryItemsModalOpen && (
										<ReOrderCategoryItemsModal
											refetchHotel={refetchHotel}
											mealPeriodId={parseInt(currentMealPeriodId)}
											menuItems={currentMenuCategory?.items}
											reorderCategoryItemsModalOpen={
												reorderCategoryItemsModalOpen
											}
											setReorderCategoryItemsModalOpen={
												setReorderCategoryItemsModalOpen
											}
										/>
									)}
									<ConfirmDeleteModal
										title='Delete menu category'
										message={
											<>
												Are you sure you want to remove the category `
												<b>{menuCategoryToDelete?.name}</b>` from the menu?
											</>
										}
										modalOpen={deleteCategoryModalOpen}
										setModalOpen={setDeleteCategoryModalOpen}
										onClose={() => setMenuCategoryToDelete(null)}
										onDelete={() => {
											if (menuCategoryToDelete?.id) {
												deleteMenuCategory({
													menuCategoryId: menuCategoryToDelete?.id
												})
											}
										}}
									/>
								</>
							) : (
								<Flex mih={400} w='100%' justify='center' align='center'>
									<NoData message='Please assign a meal period from a merchant first' />
								</Flex>
							)}
						</>
					)}
				</>
			}
		/>
	)
}

export default HotelMenu
