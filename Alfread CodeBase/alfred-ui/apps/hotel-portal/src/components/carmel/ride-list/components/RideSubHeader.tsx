import { StyledButton } from "@/design-components"
import { Grid, Flex, ActionIcon } from "@mantine/core"
import { useInterval, useMediaQuery } from "@mantine/hooks"
import { IconArrowLeft } from "@tabler/icons-react"
import { useRouter } from "next/router"
import React, { useEffect, useRef } from "react"
import useRideStore from "../../store/useRideStore"
import styled from "@emotion/styled"

const SubHeaderContainer = styled.div`
	padding: 16px 24px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

type RideSubHeaderProps = {
	isRideListScreen?: boolean
	isRideCheckoutScreen?: boolean
}

const RideSubHeader = ({
	isRideListScreen = false,
	isRideCheckoutScreen = false
}: RideSubHeaderProps) => {
	const router = useRouter()
	const timeValueRef = useRef(0)
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	const {
		rideOptions,
		setResetTimer,
		setRefetchRideList,
		setTimeValue,
		timeValue,
		setOpenChangeRideForm
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
