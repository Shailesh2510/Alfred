import useRideStore from "@/components/merchant-offerings/store/useRideStore"
import { SubHeaderContainer } from "@/components/order-page/components/main-menu/main-menu.style"
import { StyledButton } from "@/design-components"
import { Grid, Flex, ActionIcon } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconArrowLeft } from "@tabler/icons-react"
import { useRouter } from "next/router"
import React from "react"

type RideSubHeaderProps = {
	isRideListScreen?: boolean
	isRideCheckoutScreen?: boolean
}

const RideSubHeader = ({
	isRideListScreen = false,
	isRideCheckoutScreen = false
}: RideSubHeaderProps) => {
	const router = useRouter()
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const { rideOptions, setOpenChangeRideForm, timeValue } = useRideStore()

	const formatTime = (timeInSeconds: number) => {
		const minutes = Math.floor(timeInSeconds / 60)
		const seconds = timeInSeconds % 60
		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
			2,
			"0"
		)}`
	}

	return (
		<>
			{isRideListScreen && (
				<SubHeaderContainer>
					<Grid gutter={12}>
						<Grid.Col xs={12} md={6}>
							{isSmallScreen ? (
								<Flex align='center' style={{ position: "relative" }}>
									<ActionIcon
										onClick={() => {
											router.back()
										}}
										variant='transparent'
										style={{ position: "absolute", left: 0 }}
									>
										<IconArrowLeft />
									</ActionIcon>
									<Flex justify={"center"} style={{ width: "100%" }}>
										<StyledButton onClick={() => setOpenChangeRideForm(true)}>
											Change Ride
										</StyledButton>
									</Flex>
								</Flex>
							) : (
								<Flex align={"center"}>
									<ActionIcon
										onClick={() => {
											router.back()
										}}
										variant='transparent'
									>
										<IconArrowLeft />
									</ActionIcon>
									<Flex
										justify={"center"}
										align={"center"}
										sx={{ marginLeft: 12 }}
									>
										<StyledButton onClick={() => setOpenChangeRideForm(true)}>
											Change Ride
										</StyledButton>
									</Flex>
								</Flex>
							)}
						</Grid.Col>
						{rideOptions.length !== 0 ? (
							<Grid.Col xs={12} md={6}>
								<Flex
									justify={!isSmallScreen ? "flex-end" : "center"}
									align={"center"}
									sx={{ marginLeft: 12 }}
								>
									<div>{`These prices will expire in: ${formatTime(
										timeValue
									)}`}</div>
								</Flex>
							</Grid.Col>
						) : null}
					</Grid>
				</SubHeaderContainer>
			)}
			{isRideCheckoutScreen && (
				<SubHeaderContainer>
					<Grid gutter={12} align={"center"} justify='center'>
						{rideOptions.length !== 0 ? (
							<Grid.Col xs={12} md={6}>
								<Flex
									justify={"center"}
									align={"center"}
									sx={{ marginLeft: 12 }}
								>
									<div>{`These prices will expire in: ${formatTime(
										timeValue
									)}`}</div>
								</Flex>
							</Grid.Col>
						) : null}
					</Grid>
				</SubHeaderContainer>
			)}
		</>
	)
}

export default RideSubHeader
