import { Affix, Grid, Indicator, Skeleton } from "@mantine/core"
import Discount from "./components/discount"
import Cart from "./components/cart"
import HotelMenu from "./components/hotel-menu"
import Checkout from "./components/checkout"
import React, { useEffect, useMemo, useRef, useState } from "react"
import useMenu from "@/hooks/menu/useMenu"
import { filter, find, first, groupBy, isEmpty } from "lodash"
import { useRouter } from "next/router"
import useHotels from "@/hooks/hotel/useHotels"
import { cartActionTypes } from "./reducers/cartReducerts"
import { useInputState, useMediaQuery } from "@mantine/hooks"
import useVoucher from "@/hooks/voucher/useVoucher"
import {
	customNotification,
	getMealPeriodWorkingHours,
	isWithinMealPeriod
} from "@/shared-utils"
import {
	CircularCartContainer,
	MenuAndCartContainer,
	OrderPageContainer
} from "./order-page.style"
import MainMenu from "./components/main-menu/main-menu"
import { NoData } from "@/shared-components"
import ReservationModal from "./components/reservation-modal/reservation-modal"
import AlcoholConsentModal from "./components/alcohol-consent-modal"
import useMerchants from "@/hooks/hotel/useMerchants"
import { useQueryClient } from "@tanstack/react-query"
import { IconShoppingCart } from "@tabler/icons-react"
import CartModal from "./components/cart-modal"
import ScheduleOrderModalNew from "./components/schedule-order-modal/new-schedule-order-modal/schdeule-order-modal"
import useDeliveryFee from "@/hooks/hotel/useDeliveryFee"
import useCanRelayDeliverToAddress from "@/hooks/delivery/useCanRelayDeliverToAddress"
import useFeatureFlag from "@/custom-hooks/useFeatureFlag"
import MerchantSelection from "./components/merchant-selection"
import { isWithInOverNightTimeRange } from "@/shared-utils"

const OrderPage = ({ cartState, dispatchCart, featureFlagState }: any) => {
	const router = useRouter()
	const queryClient = useQueryClient()

	const pms = router.query.pms
	const hotelId = router.query.hotelId

	let mealPeriodIds: string[] = []

	let uniqueMenuCategoryNames: string[] = []

	const categoryRefs = useRef<{
		[key: string]: React.RefObject<HTMLDivElement>
	}>({})

	const { getFeatureFlag } = useFeatureFlag(featureFlagState?.featureFlags)

	const [cartHasAlcohol, setCartHasAlcohol] = useState(false)
	const [productsFilter, setProductsFilter] = useInputState<string>("")
	const [scheduleOrderModalOpen, setScheduleOrderModalOpen] =
		useInputState<boolean>(false)
	const [showReservationConfirmation, setShowReservationConfirmation] =
		useInputState<boolean>(false)
	const [selectedMerchantId, setSelectedMerchantId] = useState<number>()
	const [groupedMenuByMealPeriods, setGroupedMenuByMealPeriods] = useState<any>(
		{}
	)
	const [orderItemModalOpen, setOrderItemModalOpen] = useState(false)
	const [activeCategory, setActiveCategory] = useState<string | null>(null)
	const { data: hotels, isLoading: hotelsLoading } = useHotels()
	const {
		data: canRelayDeliverToAddress,
		isLoading: canRelayDeliverToAddressLoading
	} = useCanRelayDeliverToAddress(
		cartState?.currentHotel?.webCode,
		selectedMerchantId,
		{
			enabled: !!cartState?.currentHotel?.webCode && !!selectedMerchantId
		}
	)

	const { data: merchants, isFetching: merchantsLoading } = useMerchants(
		hotelId,
		{
			enabled: !!hotelId,
			refetchOnWindowFocus: false
		}
	)

	const { data: menu, isLoading: menuLoading } = useMenu(
		{ hotelId: cartState?.currentHotel?.id, merchantId: selectedMerchantId },
		{ enabled: !!cartState?.currentHotel?.id && !!selectedMerchantId }
	)
	const { mutate: fetchVoucher, isLoading: voucherLoading } = useVoucher({
		onSuccess: (data: any) => {
			if (Object.keys(data).length !== 0) {
				dispatchCart({
					type: cartActionTypes.SET_ORDER_TIP,
					tip: 0
				})
				dispatchCart({ type: cartActionTypes.SET_VOUCHER, voucher: data })
			} else {
				dispatchCart({
					type: cartActionTypes.SET_SHOW_VOUCHER_NOT_FOUND_POPUP,
					showVoucherNotFoundPopup: true
				})
				dispatchCart({ type: cartActionTypes.SET_VOUCHER, voucher: null })
				dispatchCart({
					type: cartActionTypes.SET_VOUCHER_CODE,
					voucherCode: ""
				})
			}
		}
	})

	const { mutate: fetchShipdayDeliveryFee } = useDeliveryFee({
		onSuccess: (data: any) => {
			const isOutsideTimeRange =
				getFeatureFlag("enable_shipday_all_day_delivery") ||
				isWithInOverNightTimeRange()
			if (
				data &&
				Object.keys(data).length !== 0 &&
				isOutsideTimeRange &&
				!canRelayDeliverToAddress
			) {
				dispatchCart({
					type: cartActionTypes.SET_SHIPDAY_DELIVERY_FEE,
					shipdayDeliveryFee: data[0].fee
				})
			}
		}
	})

	useEffect(() => {
		if (cartState?.showVoucherNotFoundPopup) {
			customNotification.error({
				title: "Failure",
				message: "Voucher not found!"
			})
			dispatchCart({
				type: cartActionTypes.SET_SHOW_VOUCHER_NOT_FOUND_POPUP,
				showVoucherNotFoundPopup: false
			})
		}
	}, [cartState?.showVoucherNotFoundPopup])

	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	const activeHotels = useMemo(
		() => filter(hotels, { isActive: true }),
		[hotels]
	)
	const setupIntersectionObserver = () => {
		const options = {
			root: null,
			rootMargin: "-250px 0px 0px 0px",
			threshold: 0.25
		}

		const observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					setActiveCategory(entry.target.getAttribute("data-category"))
				}
			})
		}, options)

		Object.values(categoryRefs.current).forEach(ref => {
			if (ref.current) {
				observer.observe(ref.current)
			}
		})

		return observer
	}

	useEffect(() => {
		const observer = setupIntersectionObserver()
		return () => observer.disconnect()
	}, [uniqueMenuCategoryNames])

	useEffect(() => {
		if (pms === "true") {
			setShowReservationConfirmation(true)
		}
	}, [pms])

	useEffect(() => {
		if (merchants && merchants.length > 0 && !merchantsLoading) {
			if (merchants.length > 1) {
				dispatchCart({
					type: cartActionTypes.SET_SHOW_MERCHANT_SELECTION_PAGE,
					showMerchantSelectionPage: true
				})
			} else {
				setSelectedMerchantId(merchants[0].id)
				dispatchCart({
					type: cartActionTypes.SET_SHOW_MERCHANT_SELECTION_PAGE,
					showMerchantSelectionPage: false
				})
				dispatchCart({
					type: cartActionTypes.SET_SELECTED_MERCHANT_COORDINATES,
					selectedMerchantCoordinates: merchants[0].coordinates
				})
			}
		}
	}, [merchants, merchantsLoading])

	useEffect(() => {
		if (router.isReady && activeHotels?.length) {
			if (hotelId) {
				const firstHotel = find(activeHotels, { webCode: hotelId })
				if (firstHotel) {
					dispatchCart({
						type: cartActionTypes.SET_CURRENT_HOTEL,
						currentHotel: firstHotel
					})
				}
			} else {
				const firstHotel: any = first(activeHotels)
				if (firstHotel) {
					router.push(`/${firstHotel?.webCode}`)
				}
			}
			queryClient.invalidateQueries(["merchants", hotelId])
		}
	}, [hotelId, activeHotels])

	useEffect(() => {
		if (cartState?.mealPeriodId) {
			const menuItem: any = find(menu, {
				mealPeriodId: cartState?.mealPeriodId
			})
			if (menuItem) {
				dispatchCart({
					type: cartActionTypes.SET_TAX_RATE,
					taxRate: parseFloat(menuItem?.taxRate) || 0
				})
			}
		}
	}, [cartState?.mealPeriodId])

	let errorMessage = ""
	if (typeof window !== "undefined") {
		errorMessage = window?.sessionStorage?.getItem("error_message") || ""
	}
	useEffect(() => {
		if (errorMessage) {
			customNotification.error(JSON.parse(errorMessage))
			window.sessionStorage.setItem("error_message", "")
		}
	}, [errorMessage])

	useEffect(() => {
		if (selectedMerchantId && !canRelayDeliverToAddressLoading) {
			fetchShipdayDeliveryFee({
				hotelId: hotelId,
				merchantId: selectedMerchantId
			})
		}
	}, [selectedMerchantId, canRelayDeliverToAddressLoading])

	useEffect(() => {
		if (!menuLoading && menu) {
			let alteredMenu = menu
			if (selectedMerchantId) {
				alteredMenu = menu.filter(
					(i: any) => i.merchantId === selectedMerchantId
				)
			}
			setGroupedMenuByMealPeriods(groupBy(alteredMenu, "mealPeriodId"))
		}
	}, [menu, menuLoading, selectedMerchantId])

	mealPeriodIds = Object.keys(groupedMenuByMealPeriods)

	useEffect(() => {
		if (!isEmpty(groupedMenuByMealPeriods)) {
			let currentMealPeriodId = null
			const firstMealPeriodId = parseInt(first(mealPeriodIds) as string)

			for (const [, value] of Object.entries(groupedMenuByMealPeriods)) {
				const { mealPeriodStartTime, mealPeriodEndTime, isLateNightMeal } =
					getMealPeriodWorkingHours({
						timezone: cartState?.currentHotel?.timezone,
						startHour: (value as any)?.[0]?.mealPeriodStartHour,
						endHour: (value as any)?.[0]?.mealPeriodEndHour
					})

				const mealPeriodIsAvailable = isWithinMealPeriod(
					mealPeriodStartTime,
					mealPeriodEndTime,
					isLateNightMeal
				)

				if (mealPeriodIsAvailable) {
					currentMealPeriodId = (value as any)?.[0]?.mealPeriodId
				}
			}

			if (currentMealPeriodId || firstMealPeriodId) {
				dispatchCart({
					type: cartActionTypes.SET_CURRENT_MEAL_PERIOD_ID,
					mealPeriodId: currentMealPeriodId
						? currentMealPeriodId
						: firstMealPeriodId
				})
			}
		}
	}, [groupedMenuByMealPeriods])

	let currentMealPeriodItems: any = first(
		Object.values(groupedMenuByMealPeriods)
	)

	if (cartState.mealPeriodId) {
		currentMealPeriodItems =
			groupedMenuByMealPeriods?.[cartState.mealPeriodId] ?? []

		uniqueMenuCategoryNames = currentMealPeriodItems
			.sort((a: any, b: any) => a.menuCategoryId - b.menuCategoryId)
			.reduce((acc: any[], item: { menuCategoryName: any }) => {
				if (!acc.includes(item.menuCategoryName)) {
					acc.push(item.menuCategoryName)
				}
				return acc
			}, [])
	}

	if (productsFilter) {
		currentMealPeriodItems = filter(
			currentMealPeriodItems,
			(mealPeriodItem: any) =>
				mealPeriodItem?.itemName
					?.toLowerCase()
					.includes(productsFilter?.toLowerCase())
		)
	}

	if (hotelId && !hotelsLoading && !find(hotels, { webCode: hotelId })) {
		return <NoData message='No hotel found' />
	}

	if (merchantsLoading) {
		return <Skeleton height={800} />
	}

	// Initialize the refs for each category
	uniqueMenuCategoryNames.forEach(categoryName => {
		if (!categoryRefs.current[categoryName]) {
			categoryRefs.current[categoryName] = React.createRef<HTMLDivElement>()
		}
	})

	// Function to handle category click and scroll to the respective section
	const handleCategoryClick = (categoryName: string) => {
		const categoryRef = categoryRefs.current[categoryName]
		if (categoryRef && categoryRef.current) {
			categoryRef.current.scrollIntoView({
				behavior: "smooth",
				inline: "nearest"
			})
			const elementPosition = categoryRef.current.getBoundingClientRect().top
			window.scrollBy({ top: elementPosition - 225, behavior: "smooth" })
		}
	}

	const handleCloseAlcoholConsentModal = () => {
		setCartHasAlcohol(false)
	}

	const handleAcceptAlcoholConsentModal = () => {
		dispatchCart({
			type: cartActionTypes.SET_SHOW_CHECKOUT_PAGE,
			showCheckoutPage: true
		})
		dispatchCart({
			type: cartActionTypes.SET_CART_HAS_ALCOHOL,
			hasAlcohol: true
		})
		setCartHasAlcohol(false)
	}

	const handleCartClick = () => {
		dispatchCart({
			type: cartActionTypes.SET_SHOW_CART_MODAL,
			showCartModal: true
		})
	}

	return (
		<OrderPageContainer>
			{cartState.showMerchantSelectionPage ? (
				<MerchantSelection
					merchants={merchants}
					cartState={cartState}
					dispatchCart={dispatchCart}
					setSelectedMerchantId={setSelectedMerchantId}
					fetchVoucher={fetchVoucher}
				/>
			) : cartState.showCheckoutPage ? (
				<Checkout
					cartState={cartState}
					dispatchCart={dispatchCart}
					setScheduleOrderModalOpen={setScheduleOrderModalOpen}
					fetchVoucher={fetchVoucher}
				/>
			) : (
				<>
					<MainMenu
						cartState={cartState}
						dispatchCart={dispatchCart}
						productsFilter={productsFilter}
						setProductsFilter={setProductsFilter}
						groupedMenuByMealPeriods={groupedMenuByMealPeriods}
						setScheduleOrderModalOpen={setScheduleOrderModalOpen}
						merchants={merchants}
						categoryNames={uniqueMenuCategoryNames}
						onCategoryClick={handleCategoryClick}
						activeCategory={activeCategory}
						fetchVoucher={fetchVoucher}
					/>
					<MenuAndCartContainer>
						<Discount
							cartState={cartState}
							dispatchCart={dispatchCart}
							fetchVoucher={fetchVoucher}
							voucherLoading={voucherLoading}
						/>
						<Grid m={0} gutter={36}>
							<Grid.Col
								offsetXs={1}
								xs={10}
								offsetSm={1}
								sm={10}
								offsetMd={1}
								md={6}
								offsetLg={2}
								lg={6}
								offsetXl={2}
								xl={6}
							>
								<HotelMenu
									cartState={cartState}
									dispatchCart={dispatchCart}
									currentMealPeriodItems={currentMealPeriodItems}
									categoryRefs={categoryRefs}
									orderItemModalOpen={orderItemModalOpen}
									setOrderItemModalOpen={setOrderItemModalOpen}
								/>
							</Grid.Col>
							<Grid.Col
								offsetXs={1}
								xs={10}
								offsetSm={1}
								sm={10}
								offsetMd={0}
								md={4}
								offsetLg={0}
								lg={3}
								offsetXl={0}
								xl={3}
							>
								{!isSmallScreen ? (
									<Cart
										cartState={cartState}
										dispatchCart={dispatchCart}
										setScheduleOrderModalOpen={setScheduleOrderModalOpen}
										mealPeriodStartHour={
											currentMealPeriodItems?.[0]?.mealPeriodStartHour
										}
										mealPeriodEndHour={
											currentMealPeriodItems?.[0]?.mealPeriodEndHour
										}
										setCartHasAlcohol={setCartHasAlcohol}
									/>
								) : null}
							</Grid.Col>
						</Grid>
					</MenuAndCartContainer>
					{isSmallScreen ? (
						<Affix position={{ bottom: 45, right: 20 }}>
							<Indicator
								color='red'
								size={16}
								offset={4}
								inline
								label={cartState?.order?.items?.reduce(
									(sum: any, item: any) => sum + item.quantity,
									0
								)}
								disabled={cartState?.order?.items.length === 0}
							>
								<CircularCartContainer>
									<IconShoppingCart
										color='white'
										onClick={() => !orderItemModalOpen && handleCartClick()}
									/>
								</CircularCartContainer>
							</Indicator>
						</Affix>
					) : null}
				</>
			)}
			{/* <ScheduleOrderModal
				cartState={cartState}
				dispatchCart={dispatchCart}
				scheduleOrderModalOpen={scheduleOrderModalOpen}
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
			/> */}
			<ScheduleOrderModalNew
				cartState={cartState}
				dispatchCart={dispatchCart}
				scheduleOrderModalOpen={scheduleOrderModalOpen}
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
				isSmallScreen={isSmallScreen}
			/>

			<ReservationModal
				cartState={cartState}
				dispatchCart={dispatchCart}
				hotelWebCode={cartState?.currentHotel?.webCode}
				showReservationConfirmation={showReservationConfirmation}
				setShowReservationConfirmation={setShowReservationConfirmation}
			/>
			<AlcoholConsentModal
				alcoholConsentModalOpen={cartHasAlcohol}
				onClose={handleCloseAlcoholConsentModal}
				handleContinue={handleAcceptAlcoholConsentModal}
			/>
			<CartModal
				cartState={cartState}
				dispatchCart={dispatchCart}
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
				setCartHasAlcohol={setCartHasAlcohol}
				scheduleOrderModalOpen={scheduleOrderModalOpen}
			/>
		</OrderPageContainer>
	)
}

export default OrderPage
