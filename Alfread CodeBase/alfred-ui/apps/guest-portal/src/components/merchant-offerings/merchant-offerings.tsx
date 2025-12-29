import React, { useEffect, useMemo, useState } from "react"
import { Card, Flex } from "@mantine/core"
import { IconCar, IconToolsKitchen2 } from "@tabler/icons-react"
import useMerchants from "@/hooks/hotel/useMerchants"
import { useRouter } from "next/router"
import { useQueryClient } from "@tanstack/react-query"
import { filter, find, first } from "lodash"
import useHotels from "@/hooks/hotel/useHotels"
import { FlexLoader, NoData } from "@/shared-components"
import useGlobalStore from "@/globalStore/globalStore"
import {
	DivRibbon,
	MerchantOfferingsContainer,
	MerchantOfferingsGrid,
	MerchantOfferingsName,
	ServiceTitle
} from "./merchant-offerings.style"

import useRideStore from "./store/useRideStore"

const MerchantOfferings = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const hotelId = router.query.hotelId
	const [isCarmelAssociated, setIsCarmelAssociated] = useState(false)

	const { setCarmelMerchantId } = useRideStore()

	const { currentHotelDetails, setCurrentHotelDetails } = useGlobalStore()

	const { data: hotels, isLoading: hotelsLoading } = useHotels({
		enabled: !!hotelId,
		refetchOnWindowFocus: false
	})

	const activeHotels = useMemo(
		() => filter(hotels, { isActive: true }),
		[hotels]
	)

	useEffect(() => {
		if (router.isReady && activeHotels?.length) {
			if (hotelId) {
				const firstHotel = find(activeHotels, { webCode: hotelId })
				if (firstHotel && firstHotel !== currentHotelDetails) {
					setCurrentHotelDetails(firstHotel)
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

	const { data: merchants, isLoading: merchantsLoading } = useMerchants(
		hotelId,
		{
			enabled: !!hotelId,
			refetchOnWindowFocus: false
		}
	)

	useEffect(() => {
		if (merchants && merchants.length > 0) {
			const isCarmelMerchantAssociated = merchants.filter((merchant: any) => {
				return merchant.merchant_type === "RIDES"
			})
			if (isCarmelMerchantAssociated.length === 0) {
				router.push(`/${hotelId}/roomService`)
			} else {
				setIsCarmelAssociated(true)
				setCarmelMerchantId(isCarmelMerchantAssociated[0].id)
			}
		}
	}, [merchants])

	if (hotelId && !hotelsLoading && !find(hotels, { webCode: hotelId })) {
		return <NoData message='No hotel found' />
	}

	return isCarmelAssociated && !merchantsLoading ? (
		<MerchantOfferingsContainer>
			<ServiceTitle>Please Select a Service:</ServiceTitle>
			<MerchantOfferingsGrid>
				<Card
					shadow='sm'
					padding='xl'
					radius='md'
					withBorder
					sx={{
						width: "300px",
						cursor: "pointer",
						transition: "transform 0.2s, box-shadow 0.2s",
						"&:hover": {
							transform: "translateY(-5px)",
							boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
						}
					}}
					onClick={() => router.push(`/${hotelId}/rides`)}
				>
					<DivRibbon>Prices as low as $69!</DivRibbon>
					<Flex direction='column' align='center' gap='md'>
						<IconCar size={48} stroke={1.5} />
						<MerchantOfferingsName>
							Private Airport Transfers
						</MerchantOfferingsName>
					</Flex>
				</Card>

				<Card
					shadow='sm'
					padding='xl'
					radius='md'
					withBorder
					sx={{
						width: "300px",
						cursor: "pointer",
						transition: "transform 0.2s, box-shadow 0.2s",
						"&:hover": {
							transform: "translateY(-5px)",
							boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
						}
					}}
					onClick={() => router.push(`/${hotelId}/roomService`)}
				>
					<DivRibbon>Available 24/7!</DivRibbon>
					<Flex direction='column' align='center' gap='md'>
						<IconToolsKitchen2 size={48} stroke={1.5} />
						<MerchantOfferingsName>In-Room Dining</MerchantOfferingsName>
					</Flex>
				</Card>
			</MerchantOfferingsGrid>
		</MerchantOfferingsContainer>
	) : (
		<FlexLoader />
	)
}

export default MerchantOfferings
