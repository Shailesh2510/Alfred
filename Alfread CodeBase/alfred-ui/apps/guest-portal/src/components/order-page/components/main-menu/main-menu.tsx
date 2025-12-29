import {
	StyledBadge,
	StyledButton,
	StyledDivider,
	StyledSearch
} from "@/design-components"
import { ActionIcon, Flex, Grid, Skeleton } from "@mantine/core"
import { isEmpty, map, sortBy } from "lodash"
import {
	SubHeaderContainer,
	MealPeriodContainer,
	SubHeaderCategoriesContainer
} from "./main-menu.style"
import { IconArrowLeft, IconCalendar, IconX } from "@tabler/icons-react"
import { ICON_SIZE } from "@/shared-constants"
import { useMediaQuery } from "@mantine/hooks"
import Categories from "../categories"
import { cartActionTypes } from "../../reducers/cartReducerts"

const MainMenu = ({
	cartState,
	dispatchCart,
	productsFilter,
	setProductsFilter,
	groupedMenuByMealPeriods,
	setScheduleOrderModalOpen,
	merchants,
	categoryNames,
	onCategoryClick,
	activeCategory,
	fetchVoucher
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	// Sort the meal periods by mealPeriodStartHour
	const sortedMealPeriods = sortBy(
		Object.values(groupedMenuByMealPeriods),
		(mealperiods: any) => parseFloat(mealperiods?.[0]?.mealPeriodStartHour)
	)

	return (
		<>
			{!isEmpty(groupedMenuByMealPeriods) ? (
				<>
					<SubHeaderContainer>
						<Grid align='center' justify='center'>
							{isSmallScreen ? (
								<>
									<Grid.Col xs={12} md={6}>
										<Flex justify='flex-start'>
											<StyledSearch
												size='sm'
												value={productsFilter}
												onChange={setProductsFilter}
												placeholder='Search for products'
											/>
											<StyledDivider
												orientation='vertical'
												h={24}
												color='gray.5'
												mx={16}
												my='auto'
											/>
											<Flex columnGap={16} align='center'>
												<StyledButton
													disabled={cartState.order?.scheduledDate}
													icon={<IconCalendar size={ICON_SIZE} />}
													onClick={() => setScheduleOrderModalOpen(true)}
												>
													Schedule order
												</StyledButton>
												{cartState.order?.scheduledDate ? (
													<ActionIcon
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_SCHEDULED_ORDER_DATE,
																scheduledDate: null
															})
														}}
													>
														<IconX size={ICON_SIZE} />
													</ActionIcon>
												) : null}
											</Flex>
										</Flex>
									</Grid.Col>
									<Grid.Col xs={12} md={6}>
										<MealPeriodContainer>
											<>
												{map(sortedMealPeriods, (mealperiods: any) => (
													<StyledBadge
														key={mealperiods?.[0]?.mealPeriodId}
														showPointer={true}
														size='xl'
														color='dark.6'
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_CURRENT_MEAL_PERIOD_ID,
																mealPeriodId: mealperiods?.[0].mealPeriodId
															})
															dispatchCart({
																type: cartActionTypes.SET_TAX_RATE,
																taxRate:
																	parseFloat(mealperiods?.[0]?.taxRate) || 0
															})
															dispatchCart({
																type: cartActionTypes.RESET_ORDER
															})
															if (cartState?.voucherCode) {
																fetchVoucher({
																	voucherCode: cartState.voucherCode,
																	hotelId: cartState.currentHotel?.id
																})
															}
														}}
														variant={
															cartState.mealPeriodId &&
															mealperiods?.[0].mealPeriodId ===
																parseInt(cartState.mealPeriodId)
																? "filled"
																: "outline"
														}
													>
														{mealperiods?.[0]?.mealPeriodName}
													</StyledBadge>
												))}
											</>
										</MealPeriodContainer>
									</Grid.Col>
								</>
							) : (
								<>
									{/* Original order for larger screens */}
									<Grid.Col xs={12} md={6}>
										<MealPeriodContainer>
											{merchants?.length > 1 && (
												<Flex align='flex-start'>
													<ActionIcon
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_SHOW_MERCHANT_SELECTION_PAGE,
																showMerchantSelectionPage: true
															})
															dispatchCart({
																type: cartActionTypes.RESET_ORDER
															})
														}}
														variant='transparent'
													>
														<IconArrowLeft />
													</ActionIcon>
												</Flex>
											)}
											<>
												{map(sortedMealPeriods, (mealperiods: any) => (
													<StyledBadge
														key={mealperiods?.[0]?.mealPeriodId}
														showPointer={true}
														size='xl'
														color='dark.6'
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_CURRENT_MEAL_PERIOD_ID,
																mealPeriodId: mealperiods?.[0].mealPeriodId
															})
															dispatchCart({
																type: cartActionTypes.SET_TAX_RATE,
																taxRate:
																	parseFloat(mealperiods?.[0]?.taxRate) || 0
															})
															dispatchCart({
																type: cartActionTypes.RESET_ORDER
															})
															if (cartState?.voucherCode) {
																fetchVoucher({
																	voucherCode: cartState.voucherCode,
																	hotelId: cartState.currentHotel?.id
																})
															}
														}}
														variant={
															cartState.mealPeriodId &&
															mealperiods?.[0].mealPeriodId ===
																parseInt(cartState.mealPeriodId)
																? "filled"
																: "outline"
														}
													>
														{mealperiods?.[0]?.mealPeriodName}
													</StyledBadge>
												))}
											</>
										</MealPeriodContainer>
									</Grid.Col>
									<Grid.Col xs={12} md={6}>
										<Flex justify='flex-end'>
											<StyledSearch
												size='sm'
												value={productsFilter}
												onChange={setProductsFilter}
												placeholder='Search for products'
											/>
											<StyledDivider
												orientation='vertical'
												h={24}
												color='gray.5'
												mx={16}
												my='auto'
											/>
											<Flex columnGap={16} align='center'>
												<StyledButton
													disabled={cartState.order?.scheduledDate}
													icon={<IconCalendar size={ICON_SIZE} />}
													onClick={() => setScheduleOrderModalOpen(true)}
												>
													Schedule order
												</StyledButton>
												{cartState.order?.scheduledDate ? (
													<ActionIcon
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_SCHEDULED_ORDER_DATE,
																scheduledDate: null
															})
														}}
													>
														<IconX size={ICON_SIZE} />
													</ActionIcon>
												) : null}
											</Flex>
										</Flex>
									</Grid.Col>
								</>
							)}
						</Grid>
					</SubHeaderContainer>
					<SubHeaderCategoriesContainer isSmallScreen={isSmallScreen}>
						<Categories
							categoryNames={categoryNames}
							onCategoryClick={onCategoryClick}
							activeCategory={activeCategory}
						/>
					</SubHeaderCategoriesContainer>
				</>
			) : (
				<Skeleton height={70} />
			)}
		</>
	)
}

export default MainMenu
