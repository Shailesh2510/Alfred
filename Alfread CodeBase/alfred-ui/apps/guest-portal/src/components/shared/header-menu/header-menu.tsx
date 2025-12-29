import React, { useEffect, useRef } from "react"
import { ActionIcon, Flex, Image } from "@mantine/core"
import { IconPhoneCall, IconMapPin, IconArrowLeft } from "@tabler/icons-react"
import {
	HeaderLogo,
	StyledHeader,
	GXPhoneNumber,
	HotelName,
	LogoAndHotelNameWrapper
} from "./header-menu.style"
import { ICON_SIZE } from "@/shared-constants"
import { useBreakPoints } from "@/shared-hooks"
import { useRouter } from "next/router"
import useGlobalStore from "@/globalStore/globalStore"
import { IHotel } from "@/interfaces/hotel"
import useHotels from "@/hooks/hotel/useHotels"
import { useInterval } from "@mantine/hooks"
import useRideStore from "@/components/merchant-offerings/store/useRideStore"

const HeaderMenu = () => {
	const { lg } = useBreakPoints()
	const router = useRouter()
	const timeValueRef = useRef(0)
	const hotelId = router.query.hotelId
	const { data: hotels } = useHotels({
		enabled: !!hotelId,
		refetchOnWindowFocus: false
	})

	const {
		rideOptions,
		setResetTimer,
		setRefetchRideList,
		setTimeValue,
		timeValue
	} = useRideStore()
	useEffect(() => {
		timeValueRef.current = timeValue
	}, [timeValue])

	const interval = useInterval(() => {
		if (timeValueRef.current > 0) {
			setTimeValue(timeValueRef.current - 1)
		} else {
			interval.stop()
			setResetTimer(true)
			setRefetchRideList(true)
		}
	}, 1000)

	useEffect(() => {
		if (rideOptions.length > 0) {
			setTimeValue(rideOptions[0]?.fare?.expiresIn || 0)
			interval.start()
		}
		return () => interval.stop()
	}, [rideOptions])

	const { currentHotelDetails, setCurrentHotelDetails } = useGlobalStore()

	const findHotelByWebCode = (hotels: IHotel[] | undefined) => {
		return hotels?.find(hotel => hotel.webCode === hotelId) || null
	}

	const currentHotel = findHotelByWebCode(hotels)

	useEffect(() => {
		if (currentHotelDetails === null) {
			setCurrentHotelDetails(currentHotel)
		}
	}, [currentHotel])

	const isOrderMenu = router.asPath.includes("order-page")

	const handleBackNavigation = () => {
		if (window.history.length > 1) {
			router.back()
		} else {
			router.push("/")
		}
	}

	return (
		<StyledHeader height={lg ? 80 : 70} $lg={lg}>
			<Flex align='center' style={{ width: "100%" }}>
				{lg && isOrderMenu && (
					<Flex align='center' justify='center' style={{ flexBasis: "10%" }}>
						<ActionIcon
							onClick={() => handleBackNavigation()}
							variant='transparent'
						>
							<IconArrowLeft />
						</ActionIcon>
					</Flex>
				)}

				<LogoAndHotelNameWrapper
					$lg={lg}
					style={{
						display: "flex",
						flexDirection: lg ? "column" : "row-reverse",
						alignItems: "center",
						justifyContent: "center",
						flex: 1
					}}
				>
					<HotelName title={currentHotelDetails?.name} $lg={false}>
						<IconMapPin size={ICON_SIZE} />
						<div
							style={{
								maxWidth: "60vw",
								overflow: "hidden",
								textOverflow: "ellipsis"
							}}
						>
							{currentHotelDetails?.name}
						</div>
					</HotelName>

					<HeaderLogo
						$lg={lg}
						style={{
							marginRight: lg ? "0" : "6px",
							marginBottom: lg ? "4px" : "0"
						}}
					>
						<Image
							src='/get-alfred-logo.png'
							alt='get alfred'
							height={lg ? 18 : 32}
							width='auto'
							p={4}
						/>
					</HeaderLogo>
				</LogoAndHotelNameWrapper>
			</Flex>

			<GXPhoneNumber $lg={lg}>
				<IconPhoneCall size={ICON_SIZE} />
				{currentHotelDetails?.gxPhoneNumber ? (
					<>
						For help, please call:
						<a href={`tel:${currentHotelDetails?.gxPhoneNumber}`}>
							{currentHotelDetails?.gxPhoneNumber}
						</a>
					</>
				) : (
					""
				)}
			</GXPhoneNumber>
		</StyledHeader>
	)
}
export default HeaderMenu
