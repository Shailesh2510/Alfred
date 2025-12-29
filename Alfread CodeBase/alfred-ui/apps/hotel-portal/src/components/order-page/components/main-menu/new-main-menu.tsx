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
import { useRouter } from "next/router"
import useCartStore from "../../stores/useCartStore"
import useGlobalStore from "@/globalStore/globalStore"
import { useRef } from "react"

const NewMainMenu = ({
	productsFilter,
	setProductsFilter,
	groupedMenuByMealPeriods,
	setScheduleOrderModalOpen,
	categoryNames,
	onCategoryClick,
	activeCategory,
	fetchVoucher
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const router = useRouter()
	const categoriesRef = useRef<HTMLDivElement>(null)

	const {
		order,
		setScheduledOrderDate,
		setCurrentMealPeriodId,
		setTaxRate,
		resetOrder,
		mealPeriodId,
		voucherCode
	} = useCartStore()

	const { currentHotelDetails } = useGlobalStore()

	const sortedMealPeriods = sortBy(
		Object.values(groupedMenuByMealPeriods),
		(mealperiods: any) => parseFloat(mealperiods?.[0]?.mealPeriodStartHour)
	)

	const handleBackNavigation = () => {
		if (window.history.length > 1) {
			router.back()
		} else {
			router.push("/")
		}
	}

	const handleSearchKeyDown = (e: {
		key: string
		currentTarget: { blur: () => any }
		preventDefault: () => void
		stopPropagation: () => void
	}) => {
		if (e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			e.currentTarget.blur()
			window.scrollTo({ top: window.innerHeight * 0.5, behavior: "smooth" })
		}
	}

	const searchInputProps = {
		size: "sm",
		value: productsFilter,
		onChange: setProductsFilter,
		placeholder: "Search for products",
		id: "search-input",
		onKeyDown: handleSearchKeyDown
	}

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
											<StyledSearch {...searchInputProps} />
											<StyledDivider
												orientation='vertical'
												h={24}
												color='gray.5'
												mx={16}
												my='auto'
											/>
											<Flex columnGap={16} align='center'>
												<StyledButton
													disabled={order?.scheduledDate}
													icon={<IconCalendar size={ICON_SIZE} />}
													onClick={() => setScheduleOrderModalOpen(true)}
												>
													Schedule order
												</StyledButton>
												{order?.scheduledDate ? (
													<ActionIcon
														onClick={() => {
															setScheduledOrderDate(null)
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
															setCurrentMealPeriodId(
																mealperiods?.[0].mealPeriodId
															)
															setTaxRate(
																parseFloat(
																	mealperiods?.[0]?.taxRate
																).toString() || "0"
															)
															resetOrder()
															if (voucherCode) {
																fetchVoucher({
																	voucherCode: voucherCode,
																	hotelId: currentHotelDetails?._id
																})
															}
														}}
														variant={
															mealPeriodId &&
															mealperiods?.[0].mealPeriodId ===
																parseInt(mealPeriodId)
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
											<Flex align='flex-start'>
												<ActionIcon
													onClick={() => {
														resetOrder()
														handleBackNavigation()
													}}
													variant='transparent'
												>
													<IconArrowLeft />
												</ActionIcon>
											</Flex>
											<>
												{map(sortedMealPeriods, (mealperiods: any) => (
													<StyledBadge
														key={mealperiods?.[0]?.mealPeriodId}
														showPointer={true}
														size='xl'
														color='dark.6'
														onClick={() => {
															setCurrentMealPeriodId(
																mealperiods?.[0].mealPeriodId
															)
															setTaxRate(
																parseFloat(
																	mealperiods?.[0]?.taxRate
																).toString() || "0"
															)
															resetOrder()
															if (voucherCode) {
																fetchVoucher({
																	voucherCode: voucherCode,
																	hotelId: currentHotelDetails?._id
																})
															}
														}}
														variant={
															mealPeriodId &&
															mealperiods?.[0].mealPeriodId ===
																parseInt(mealPeriodId)
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
											<StyledSearch {...searchInputProps} />
											<StyledDivider
												orientation='vertical'
												h={24}
												color='gray.5'
												mx={16}
												my='auto'
											/>
											<Flex columnGap={16} align='center'>
												<StyledButton
													disabled={order?.scheduledDate}
													icon={<IconCalendar size={ICON_SIZE} />}
													onClick={() => setScheduleOrderModalOpen(true)}
												>
													Schedule order
												</StyledButton>
												{order?.scheduledDate ? (
													<ActionIcon
														onClick={() => {
															setScheduledOrderDate(null)
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
					<SubHeaderCategoriesContainer
						ref={categoriesRef}
						isSmallScreen={isSmallScreen}
					>
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

export default NewMainMenu
