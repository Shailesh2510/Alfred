import React, { useEffect, useState } from "react"
import { Grid, Card, Image, Skeleton, Flex } from "@mantine/core"
import {
	MerchantDescription,
	MerchantGrid,
	MerchantName,
	MerchantSelectionContainer,
	MerchantSelectionDescription,
	MerchantSelectionTextContainer
} from "./merchant-selection.style"
import useMerchants from "@/hooks/hotel/useMerchants"
import { useRouter } from "next/router"
import { orderBy } from "lodash"
import useVoucher from "@/hooks/voucher/useVoucher"
import useGlobalStore from "@/globalStore/globalStore"
import useCartStore from "../../stores/useCartStore"
import customNotification from "../../../../../../../shared/ui/shared-utils/customNotification"
import { Merchant } from "@/interfaces/merchants"
import { MERCHANT_TYPE_RIDES } from "@/shared-constants"
import useCurrentHotel from "@/hooks/me/useCurrentHotel"

const NewMerchantSelection = () => {
	const router = useRouter()
	//const hotelId = router.query.hotelId
	const { data: me } = useCurrentHotel()
	const currentHotel = me?.data?.[0]
	const hotelId = currentHotel?.webCode
	const { currentHotelDetails, setCurrentHotelDetails } = useGlobalStore()
	const [availableMerchants, setAvailableMerchants] = useState<Array<Merchant>>(
		[]
	)
	const searchParams = new URLSearchParams(router.asPath.split("?")[1])
	const voucherCode = searchParams.get("voucher")
	let finalUrl = `/roomService`

	const {
		setOrderTip,
		setVoucher,
		setVoucherCode,
		resetOrder,
		setSelectedMerchantCoordinates,
		setMerchantDetails
	} = useCartStore()

	const { data: merchants, isLoading: merchantsLoading } = useMerchants(
		hotelId,
		{
			enabled: !!hotelId,
			refetchOnWindowFocus: false
		}
	)
	const { mutate: fetchVoucher } = useVoucher({
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

				resetOrder()
			}
		}
	})

	useEffect(() => {
		if (!currentHotelDetails) {
			setCurrentHotelDetails(currentHotel)
		}
	}, [currentHotel])

	useEffect(() => {
		if (merchants && merchants?.length > 0) {
			const sortedMerchants = orderBy(
				merchants?.filter(
					(m: any) =>
						!m.allow_catering && m.merchant_type !== MERCHANT_TYPE_RIDES
				),
				["order_position", "id"]
			)
			setAvailableMerchants(sortedMerchants)
		}
	}, [merchants])

	useEffect(() => {
		if (availableMerchants && availableMerchants.length === 1) {
			finalUrl += `/${availableMerchants[0].id}/order-page`
			if (searchParams.toString()) {
				finalUrl += `?${searchParams.toString()}`
			}
			router.push(finalUrl)
		}
	}, [availableMerchants])

	if (merchantsLoading) {
		return <Skeleton height={800} />
	}
	const handleMerchantSelection = (merchant: any) => {
		resetOrder()
		setMerchantDetails(merchant)
		setSelectedMerchantCoordinates(merchant?.coordinates)
		if (voucherCode) {
			fetchVoucher({
				voucherCode: voucherCode,
				hotelId: currentHotelDetails._id
			})
		}
		finalUrl += `/${merchant?.id}/order-page`
		if (searchParams.toString()) {
			finalUrl += `?${searchParams.toString()}`
		}
		router.push(finalUrl)
	}

	return (
		<MerchantSelectionContainer>
			{availableMerchants?.length > 1 && (
				<div>
					<Grid gutter={24} justify='center' align='center'>
						<Grid.Col xs={12} sm={8} md={8} lg={8} xl={4}>
							<MerchantSelectionTextContainer>
								<MerchantSelectionDescription>
									Please Select a Dining Option:
								</MerchantSelectionDescription>
							</MerchantSelectionTextContainer>
						</Grid.Col>
					</Grid>

					{availableMerchants?.map((merchant: any) => {
						return (
							<MerchantGrid align='center' justify='center' key={merchant.id}>
								<Grid.Col xs={12} sm={8} md={8} lg={8} xl={4}>
									<Card
										shadow='sm'
										padding='lg'
										radius='md'
										withBorder
										sx={{
											cursor: "pointer",
											transition: "transform 0.2s, box-shadow 0.2s",
											"&:hover": {
												boxShadow: "0 0 4px rgba(0, 0, 0, 0.2)"
											}
										}}
										onClick={() => handleMerchantSelection(merchant)}
									>
										<div style={{ display: "flex", alignItems: "center" }}>
											<Image
												width={80}
												height={80}
												src={merchant?.image_url || "/food.jpg"}
												alt={"Alt Image"}
												radius={8}
												style={{ marginRight: "16px" }}
											/>
											<Flex direction='column'>
												<MerchantName>{merchant.name}</MerchantName>
												<MerchantDescription>
													{merchant.description}
												</MerchantDescription>
											</Flex>
										</div>
									</Card>
								</Grid.Col>
							</MerchantGrid>
						)
					})}
				</div>
			)}
		</MerchantSelectionContainer>
	)
}

export default NewMerchantSelection
