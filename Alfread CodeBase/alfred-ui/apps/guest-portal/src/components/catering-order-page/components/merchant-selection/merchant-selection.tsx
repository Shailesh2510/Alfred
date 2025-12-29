import React from "react"
import { Grid, Card, Image, Flex } from "@mantine/core"
import {
	MerchantGrid,
	MerchantDescription,
	MerchantName,
	MerchantSelectionDescription
} from "./merchant-selection.style"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import { MERCHANT_TYPE_RIDES } from "@/shared-constants"

const MerchantSelection = ({
	merchants,
	cartState,
	dispatchCart,
	setSelectedMerchantId
}: any) => {
	if (!cartState.showMerchantSelectionPage) {
		return null
	}

	const handleMerchantSelection = (merchant: any) => {
		setSelectedMerchantId(merchant?.id)
		dispatchCart({
			type: cartActionTypes.SET_SHOW_MERCHANT_SELECTION_PAGE,
			showMerchantSelectionPage: false
		})

		dispatchCart({
			type: cartActionTypes.SET_SELECTED_MERCHANT_COORDINATES,
			selectedMerchantCoordinates: merchant?.coordinates
		})
	}

	return (
		<>
			<MerchantSelectionDescription align='center' justify='center'>
				Please Select a Dining Option:
			</MerchantSelectionDescription>
			{merchants
				?.filter(
					(m: any) =>
						m.allow_catering && m.merchant_type !== MERCHANT_TYPE_RIDES
				)
				.map((merchant: any) => {
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
		</>
	)
}

export default MerchantSelection
