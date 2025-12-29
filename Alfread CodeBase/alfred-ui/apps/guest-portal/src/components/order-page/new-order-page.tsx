import { Affix, Grid, Indicator } from "@mantine/core"
import Discount from "./components/discount"
import HotelMenu from "./components/hotel-menu"
import React, { useEffect, useRef, useState } from "react"
import useMenu from "@/hooks/menu/useMenu"
import { filter, find, first, groupBy, isEmpty, orderBy } from "lodash"
import { useRouter } from "next/router"
import { useInputState, useMediaQuery } from "@mantine/hooks"
import useVoucher from "@/hooks/voucher/useVoucher"
import {
	customNotification,
	getMealPeriodWorkingHours,
	isWithinMealPeriod,
	isWithInOverNightTimeRange
} from "@/shared-utils"
import {
	CircularCartContainer,
	MenuAndCartContainer,
	OrderPageContainer
} from "./order-page.style"
import AlcoholConsentModal from "./components/alcohol-consent-modal"
import { IconShoppingCart } from "@tabler/icons-react"
import ScheduleOrderModalNew from "./components/schedule-order-modal/new-schedule-order-modal/schdeule-order-modal"
import useDeliveryFee from "@/hooks/hotel/useDeliveryFee"
import useFeatureFlag from "@/custom-hooks/useFeatureFlag"
import NewCart from "./components/cart/new-cart"
import NewMainMenu from "./components/main-menu/new-main-menu"
import NewCartModal from "./components/cart-modal/new-cart-modal"
import useHotels from "@/hooks/hotel/useHotels"
import { IHotel } from "@/interfaces/hotel"
import useGlobalStore from "@/globalStore/globalStore"
import useCartStore from "./stores/useCartStore"
import useCanRelayDeliverToAddress from "@/hooks/delivery/useCanRelayDeliverToAddress"
import PaymentFailedModal from "./components/payment-failed/payment-failed"

const NewOrderPage = () => {
	const router = useRouter()
	const { hotelId, merchantId } = router.query
	let mealPeriodIds: string[] = []
	const searchParams = new URLSearchParams(router.asPath.split("?")[1])
	let checkoutURL = `/${hotelId}/roomService/${merchantId}/checkout`
	let uniqueMenuCategoryNames: string[] = []
	const isUserScrolling = useRef(false)
	const categoryRefs = useRef<{
		[key: string]: React.RefObject<HTMLDivElement>
	}>({})

	const {
		setOrderTip,
		setVoucher,
		setVoucherCode,
		setShipdayDeliveryFee,
		setTaxRate,
		mealPeriodId,
		setCurrentMealPeriodId,
		setCartHasAlcohol,
		setShowCartModal,
		order
	} = useCartStore()

	const { featureFlags, currentHotelDetails, setCurrentHotelDetails } =
		useGlobalStore()

	const findHotelByWebCode = (hotels: IHotel[] | undefined) => {
		return hotels?.find(hotel => hotel.webCode === hotelId) || null
	}

	const { getFeatureFlag } = useFeatureFlag(featureFlags)
	const { data: hotels } = useHotels({
		enabled: !!hotelId,
		refetchOnWindowFocus: false
	})

	const {
		data: canRelayDeliverToAddress,
		isLoading: canRelayDeliverToAddressLoading
	} = useCanRelayDeliverToAddress(hotelId, merchantId, { enabled: !!hotelId })

	const [showAlcoholConsentModal, setShowAlcoholConsentModal] = useState(false)
	const [productsFilter, setProductsFilter] = useInputState<string>("")
	const [scheduleOrderModalOpen, setScheduleOrderModalOpen] =
		useInputState<boolean>(false)

	const [groupedMenuByMealPeriods, setGroupedMenuByMealPeriods] = useState<any>(
		{}
	)

	const currentHotel = findHotelByWebCode(hotels)

	const [orderItemModalOpen, setOrderItemModalOpen] = useState(false)
	const [activeCategory, setActiveCategory] = useState<string | null>(null)

	const { data: menu, isLoading: menuLoading } = useMenu(
		{ hotelId: currentHotel?.id, merchantId: merchantId },
		{ enabled: !!currentHotel?.id && !!currentHotel }
	)
	const { mutate: fetchVoucher, isLoading: voucherLoading } = useVoucher({
		onSuccess: (data: any) => {
			if (Object.keys(data).length !== 0) {
				setOrderTip(0)
				setVoucher(data)
			} else {
				customNotification.error({
					title: "Failure",
					message: "Voucher not found!"
				})
				setVoucher(null)
				setVoucherCode("")
			}
		}
	})

	useEffect(() => {
		if (currentHotelDetails === null) {
			setCurrentHotelDetails(currentHotel)
		}
	}, [currentHotel])

	const { mutate: fetchShipdayDeliveryFee } = useDeliveryFee({
		onSuccess: (data: any) => {
			//Uncomment this to test over night meal deliveries
			const isOutsideTimeRange =
				getFeatureFlag("enable_shipday_all_day_delivery") ||
				isWithInOverNightTimeRange()

			if (
				data &&
				Object.keys(data).length !== 0 &&
				(isOutsideTimeRange || !canRelayDeliverToAddress)
			) {
				setShipdayDeliveryFee(data[0].fee)
			}
		}
	})

	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	const setupIntersectionObserver = () => {
		const options = {
			root: null,
			rootMargin: "-220px 0px 0px 0px",
			threshold: 0
		}

		const observer = new IntersectionObserver(entries => {
			if (isUserScrolling.current) {
				return
			}

			entries.forEach(entry => {
				if (entry.isIntersecting) {
					setActiveCategory(entry.target.getAttribute("data-category"))
				}
			})
		}, options)

		Object.entries(categoryRefs.current).forEach(([key, ref]) => {
			if (ref.current && uniqueMenuCategoryNames.includes(key)) {
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
		if (mealPeriodId) {
			const menuItem: any = find(menu, {
				mealPeriodId: mealPeriodId
			})
			if (menuItem) {
				setTaxRate(parseFloat(menuItem?.taxRate).toString() || "0")
			}
		}
	}, [mealPeriodId])

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
		if (merchantId && !canRelayDeliverToAddressLoading) {
			fetchShipdayDeliveryFee({
				hotelId: hotelId,
				merchantId: merchantId
			})
		}
	}, [merchantId, canRelayDeliverToAddressLoading])

	useEffect(() => {
		if (!menuLoading && menu) {
			let alteredMenu = menu
			if (merchantId) {
				const merchantIdString = Array.isArray(merchantId)
					? merchantId[0]
					: merchantId
				const merchantIdNumber = parseInt(merchantIdString)
				alteredMenu = menu.filter((i: any) => i.merchantId === merchantIdNumber)
			}
			setGroupedMenuByMealPeriods(groupBy(alteredMenu, "mealPeriodId"))
			setCurrentMealPeriodId(null)
		}
	}, [menuLoading, menu, merchantId])

	mealPeriodIds = Object.keys(groupedMenuByMealPeriods)

	useEffect(() => {
		if (!isEmpty(groupedMenuByMealPeriods)) {
			let currentMealPeriodId = null
			const firstMealPeriodId = parseInt(first(mealPeriodIds) as string)

			for (const [, value] of Object.entries(groupedMenuByMealPeriods)) {
				const { mealPeriodStartTime, mealPeriodEndTime, isLateNightMeal } =
					getMealPeriodWorkingHours({
						timezone: currentHotelDetails?.timezone,
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
				setCurrentMealPeriodId(
					currentMealPeriodId ? currentMealPeriodId : firstMealPeriodId
				)
			}
		}
	}, [groupedMenuByMealPeriods])

	let currentMealPeriodItems: any = first(
		Object.values(groupedMenuByMealPeriods)
	)

	if (mealPeriodId) {
		currentMealPeriodItems = groupedMenuByMealPeriods?.[mealPeriodId] ?? []
		currentMealPeriodItems = orderBy(currentMealPeriodItems, [
			item => item.menuCategoryPosition ?? item.menuCategoryId
		])
		uniqueMenuCategoryNames = currentMealPeriodItems.reduce(
			(acc: any[], item: { menuCategoryName: any }) => {
				if (!acc.includes(item.menuCategoryName)) {
					acc.push(item.menuCategoryName)
				}
				return acc
			},
			[]
		)
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
			isUserScrolling.current = true

			categoryRef.current.scrollIntoView({
				behavior: "smooth",
				inline: "nearest"
			})
			const elementPosition = categoryRef.current.getBoundingClientRect().top
			window.scrollBy({ top: elementPosition - 225, behavior: "smooth" })

			setTimeout(() => {
				isUserScrolling.current = false
			}, 500)
		}
	}

	const handleCloseAlcoholConsentModal = () => {
		setShowAlcoholConsentModal(false)
	}

	const handleAcceptAlcoholConsentModal = () => {
		setCartHasAlcohol(true)
		setShowAlcoholConsentModal(false)
		if (searchParams.toString()) {
			checkoutURL += `?${searchParams.toString()}`
		}
		router.push(checkoutURL)
	}

	const handleCartClick = () => {
		setShowCartModal(true)
	}

	return (
		<OrderPageContainer>
			<>
				<NewMainMenu
					productsFilter={productsFilter}
					setProductsFilter={setProductsFilter}
					groupedMenuByMealPeriods={groupedMenuByMealPeriods}
					setScheduleOrderModalOpen={setScheduleOrderModalOpen}
					categoryNames={uniqueMenuCategoryNames}
					onCategoryClick={handleCategoryClick}
					activeCategory={activeCategory}
					fetchVoucher={fetchVoucher}
				/>
				<MenuAndCartContainer>
					<Discount
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
								<NewCart
									setScheduleOrderModalOpen={setScheduleOrderModalOpen}
									mealPeriodStartHour={
										currentMealPeriodItems?.[0]?.mealPeriodStartHour
									}
									mealPeriodEndHour={
										currentMealPeriodItems?.[0]?.mealPeriodEndHour
									}
									setShowAlcoholConsentModal={setShowAlcoholConsentModal}
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
							label={order?.items?.reduce(
								(sum: any, item: any) => sum + item.quantity,
								0
							)}
							disabled={order?.items.length === 0}
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

			{/* <ScheduleOrderModal
				cartState={cartState}
				dispatchCart={dispatchCart}
				scheduleOrderModalOpen={scheduleOrderModalOpen}
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
			/> */}
			<ScheduleOrderModalNew
				scheduleOrderModalOpen={scheduleOrderModalOpen}
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
				isSmallScreen={isSmallScreen}
			/>
			<AlcoholConsentModal
				alcoholConsentModalOpen={showAlcoholConsentModal}
				onClose={handleCloseAlcoholConsentModal}
				handleContinue={handleAcceptAlcoholConsentModal}
			/>
			<NewCartModal
				setScheduleOrderModalOpen={setScheduleOrderModalOpen}
				mealPeriodStartHour={currentMealPeriodItems?.[0]?.mealPeriodStartHour}
				mealPeriodEndHour={currentMealPeriodItems?.[0]?.mealPeriodEndHour}
				setShowAlcoholConsentModal={setShowAlcoholConsentModal}
				scheduleOrderModalOpen={scheduleOrderModalOpen}
			/>
			<PaymentFailedModal />
		</OrderPageContainer>
	)
}

export default NewOrderPage
