import { PageStructure } from "@/shared-components"
import { Flex, Grid, Loader } from "@mantine/core"
import { useRouter } from "next/router"
import useHotel from "@/hooks/hotel/useHotel"
import { StyledBadge, StyledContainerWithTitle } from "@/design-components"
import { FieldLabel, FieldValue } from "./hotel-details.style"
import HotelDetailsMenu from "../shared/hotel-details-menu"
import React from "react"

const HotelDetails = () => {
	const router = useRouter()
	const hotelId = router.query.id

	const { data: hotel, isLoading: hotelLoading } = useHotel(
		{ hotelId },
		{
			enabled: !!hotelId
		}
	)

	const currentHotel = hotel?.data?.[0]

	return (
		<PageStructure
			goBack
			title={currentHotel?.name ? `${currentHotel?.name} - Details` : null}
			subHeaderContent={<HotelDetailsMenu hotelId={hotelId} />}
			pageContent={
				<>
					{hotelLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<Grid gutter={36} m={12}>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Information'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Name</FieldLabel>
											<FieldValue>{currentHotel?.name}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Code</FieldLabel>
											<FieldValue>{currentHotel?.code}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Web code</FieldLabel>
											<FieldValue>{currentHotel?.webCode}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Coordinates</FieldLabel>
											<FieldValue>{`Longitude: ${parseFloat(
												currentHotel?.coordinates?.x
											)?.toFixed(4)} Latitude: ${parseFloat(
												currentHotel?.coordinates?.y
											).toFixed(4)}`}</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Address'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>City</FieldLabel>
											<FieldValue>{currentHotel?.cityName}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Town</FieldLabel>
											<FieldValue>{currentHotel?.addressTown}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Street</FieldLabel>
											<FieldValue>{currentHotel?.addressStreet}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Zip code</FieldLabel>
											<FieldValue>{currentHotel?.addressZipCode}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Number</FieldLabel>
											<FieldValue>{currentHotel?.addressNumber}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Delivery insructions</FieldLabel>
											<FieldValue>
												{currentHotel?.deliveryInstructions}
											</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Contact'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Contact name</FieldLabel>
											<FieldValue>{currentHotel?.contactName}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Contact email</FieldLabel>
											<FieldValue>{currentHotel?.contactEmail}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Contact phone</FieldLabel>
											<FieldValue>{currentHotel?.contactPhone}</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Configuration'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Is active</FieldLabel>
											<FieldValue>
												{currentHotel?.isActive ? "Yes" : "No"}
											</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Tax exempt</FieldLabel>
											<FieldValue>
												{currentHotel?.isTaxExampt ? "Yes" : "No"}
											</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Allows credit card</FieldLabel>
											<FieldValue>
												{currentHotel?.allowCreditCard ? "Yes" : "No"}
											</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Allows room charge</FieldLabel>
											<FieldValue>
												{currentHotel?.allowRoomCharge ? "Yes" : "No"}
											</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Is web enabled</FieldLabel>
											<FieldValue>
												{currentHotel?.isWebEnabled ? "Yes" : "No"}
											</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Rooms'>
									<Flex columnGap={4}>
										{currentHotel?.rooms?.map((room: string) => (
											<React.Fragment key={room}>
												{room ? (
													<StyledBadge color='green.8'>{room}</StyledBadge>
												) : null}
											</React.Fragment>
										))}
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
						</Grid>
					)}
				</>
			}
		/>
	)
}

export default HotelDetails
