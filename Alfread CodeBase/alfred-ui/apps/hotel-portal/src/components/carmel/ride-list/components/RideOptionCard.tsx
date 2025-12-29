import React from "react"
import { Flex, Image } from "@mantine/core"
import styled from "@emotion/styled"
import { StyledButton } from "@/design-components"
import { customNotification, showPrice } from "@/shared-utils"
import { useRouter } from "next/router"
import {
	IconDisabled,
	IconBriefcaseFilled,
	IconUserFilled
} from "@tabler/icons-react"
import useRideStore from "../../store/useRideStore"

const RideOptionContainer = styled.div`
	display: flex;
	padding: 16px;
	border-radius: 8px;
	height: 100%;
	justify-content: space-between;
	border: 1px solid ${({ theme }) => theme.colors.gray[2]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

const RideOptionName = styled.div`
	${({ theme }) => theme.other.typography.lg700};
`

const RideOptionDescriptions = styled.div`
	${({ theme }) => theme.other.typography.sm400};
`

const RideOptionPrice = styled.div`
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.black};
`

const ImageContainer = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
`

type RideOptionCardProps = {
	id: string
	name: string
	baseFare: number
	price: number
	imageUrl: string
	maxPassengers: number
	maxLuggage: number
	carClassId: string
	wheelChairAccessible: boolean
	isSmallScreen: boolean
}

const RideOptionCard = ({
	id,
	name,
	baseFare,
	price,
	imageUrl,
	maxPassengers,
	maxLuggage,
	carClassId,
	wheelChairAccessible,
	isSmallScreen
}: RideOptionCardProps) => {
	const { addRide, rideOptions, ride, setOpenChangeRideForm } = useRideStore()
	const router = useRouter()
	const { merchantId } = router.query
	const searchParams = new URLSearchParams(router.asPath.split("?")[1])
	let checkoutUrl = `/rides/${merchantId}/checkout`

	const handleItemClick = () => {
		addRide({
			id: id,
			name: name,
			cartItemId: id,
			cartItemTime: new Date(),
			imageUrl: imageUrl,
			baseFare: baseFare,
			serviceFee: price - baseFare,
			price: price,
			carClassId: carClassId
		})
		const rideFareIdExists = rideOptions.filter(
			(rideOption: any) =>
				rideOption.carClassDesc.toLowerCase().trim() ===
				ride?.items?.name.toLowerCase().trim()
		)

		if (rideFareIdExists[0]?.fare?.fareId !== ride?.items?.id) {
			customNotification.error("Please select a valid ride option")
			setOpenChangeRideForm(true)
			return
		}
		if (searchParams.toString()) {
			checkoutUrl += `?${searchParams.toString()}`
		}
		router.push(checkoutUrl)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<RideOptionContainer style={{ cursor: "pointer" }}>
			<Flex
				direction={{ base: "row" }}
				justify={{ base: "center", lg: "space-between" }}
				gap={{ base: "md", lg: "lg" }}
				style={{ flex: 1 }}
			>
				<Flex
					direction='column'
					justify='space-between'
					align={{ base: "flex-start" }}
					style={{ flex: 1 }}
				>
					<Flex direction='column' gap={"xs"}>
						<RideOptionName>{name}</RideOptionName>

						<RideOptionDescriptions>
							<Flex direction='row' align={"center"}>
								<IconUserFilled />
								{`${maxPassengers} People`}
							</Flex>
						</RideOptionDescriptions>
						<RideOptionDescriptions>
							<Flex direction='row' align={"center"}>
								<IconBriefcaseFilled style={{ marginRight: "4px" }} />
								{`${maxLuggage} Bags`}
							</Flex>
						</RideOptionDescriptions>

						<RideOptionDescriptions>
							<Flex direction='row' align={"center"}>
								{wheelChairAccessible ? <IconDisabled /> : null}
							</Flex>
						</RideOptionDescriptions>
					</Flex>
					<RideOptionPrice>{showPrice(price)}</RideOptionPrice>
				</Flex>
				<ImageContainer>
					<Image
						width={isSmallScreen ? 100 : 162}
						height={isSmallScreen ? 100 : 162}
						src={imageUrl || "/food.jpg"}
						alt={name}
						radius={8}
						onClick={e => e.preventDefault()}
						style={{
							cursor: "default"
						}}
						fit='contain'
					/>
					<StyledButton
						color='dark.9'
						variant='outline'
						pos='absolute'
						top={4}
						right={4}
						onClick={handleItemClick}
					>
						Book
					</StyledButton>
				</ImageContainer>
			</Flex>
		</RideOptionContainer>
	)
}

export default RideOptionCard
