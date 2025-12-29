import { Flex, Grid, Skeleton } from "@mantine/core"
import { HotelName, OrderPageHeaderContainer } from "./hotel-header.style"
import { useMediaQuery } from "@mantine/hooks"

const OrderPageHeader = ({ hotelName }: any) => {
	const smallScreen = useMediaQuery("(max-width: 768px)")

	if (!hotelName) {
		return <Skeleton height={125} />
	}

	return (
		<OrderPageHeaderContainer>
			<Grid m={0}>
				<Grid.Col span={12}>
					<Flex>
						<HotelName smallScreen={smallScreen}>{hotelName}</HotelName>
					</Flex>
				</Grid.Col>
			</Grid>
		</OrderPageHeaderContainer>
	)
}

export default OrderPageHeader
