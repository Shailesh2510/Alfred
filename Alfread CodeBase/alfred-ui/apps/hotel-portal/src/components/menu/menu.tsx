import { Accordion, Divider, Flex, Loader, Tabs } from "@mantine/core"
import { IconCircleChevronDown } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { filter, groupBy, map, orderBy, size } from "lodash"
import { useInputState } from "@mantine/hooks"
import MenuItemTable from "./components/menu-items-table"
import { PageStructure } from "@/shared-components"
import { ICON_SIZE } from "@/shared-constants"
import useMenuCategories from "@/hooks/menu-category/useMenuCategories"
import useMealPeriods from "@/hooks/meal-period/useMealPeriods"
import useMenuDetailed from "@/hooks/menu/useMenuDetailed"
import { getMealPeriodWorkingHours } from "@/shared-utils"
import {
	StyledTab,
	StyledTabs,
	MenuTabContainer,
	MenuTitle,
	MenuTime,
	MenuPageContainer,
	RestaurantTitle,
	RestaurantID,
	StyledAccordion
} from "./menu.style"

const HotelMenu = () => {
	const [currentMealPeriodId, setCurrentMealPeriodId] = useInputState("")
	const [activeMenuCategories, setActiveMenuCategories] = useState<string[]>([])

	const { data: menu, isLoading: menuLoading } = useMenuDetailed()
	const { data: mealPeriods, isLoading: mealPeriodsLoading } = useMealPeriods()
	const { data: menuCategories, isLoading: menuCategoriesLoading } =
		useMenuCategories()

	const groupedMenu = useMemo(
		() => groupBy(menu?.data, "menuCategoryId"),
		[menu]
	)
	const orderedMealPeriods = useMemo(
		() => orderBy(mealPeriods?.data, "startHour"),
		[mealPeriods?.data]
	)
	const currentMenuCategories: any = useMemo(
		() =>
			filter(menuCategories?.data, {
				mealPeriodId: parseInt(currentMealPeriodId)
			}),
		[menuCategories?.data, currentMealPeriodId]
	)

	useEffect(() => {
		const firstMealPeriod = orderedMealPeriods?.[0]
		if (!currentMealPeriodId && firstMealPeriod) {
			setCurrentMealPeriodId(firstMealPeriod?.id?.toString())
		}
	}, [currentMealPeriodId, orderedMealPeriods])

	useEffect(() => {
		if (currentMenuCategories?.length) {
			setActiveMenuCategories(
				map(currentMenuCategories, menuCategory => menuCategory?.id?.toString())
			)
		}
	}, [currentMenuCategories])

	return (
		<PageStructure
			goBack
			title='Menu'
			pageContent={
				<>
					{menuLoading || mealPeriodsLoading || menuCategoriesLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
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
																{map(currentMenuCategories, menuCategory => (
																	<StyledAccordion
																		multiple
																		value={activeMenuCategories}
																		onChange={setActiveMenuCategories}
																		chevron={
																			<IconCircleChevronDown size={ICON_SIZE} />
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
																					</Flex>
																				</Flex>
																			</Accordion.Control>
																			<Accordion.Panel>
																				<MenuItemTable
																					menuItems={map(
																						groupedMenu?.[menuCategory?.id],
																						menuCategoryItem => ({
																							price: menuCategoryItem?.price,
																							itemId: menuCategoryItem?.itemId,
																							name: menuCategoryItem?.itemName,
																							newPrice:
																								menuCategoryItem?.newPrice,
																							menuItemId:
																								menuCategoryItem?.menuItemId,
																							modifiers:
																								menuCategoryItem?.modifiers,
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
																))}
															</>
														) : null}
													</Tabs.Panel>
												))}
											</>
										) : null}
									</StyledTabs>
								</MenuPageContainer>
							)}
						</>
					)}
				</>
			}
		/>
	)
}

export default HotelMenu
