import { PageStructure } from "@/shared-components"
import { Flex, Grid, List, Loader } from "@mantine/core"
import {
	WelcomeMessage,
	PageSubtitle,
	PartnerCard,
	PartnerName,
	PartnerEmail,
	PartnerMealPeriod,
	PartnerPhone
} from "./dashboard.style"
import useHotels from "@/hooks/hotel/useHotels"
import useMerchants from "@/hooks/merchant/useMerchants"
import { orderBy } from "lodash"
import { getMealPeriodWorkingHours } from "@/shared-utils"

const Dashboard = () => {
	const { data: hotels } = useHotels()
	const { data: merchants } = useMerchants()

	return (
		<PageStructure
			pageContent={
				<Flex p={20} direction='column'>
					<WelcomeMessage>Welcome to Get Alfred admin app</WelcomeMessage>
					<PageSubtitle>Hotels</PageSubtitle>
					<Grid mb={20}>
						{hotels?.data ? (
							<>
								{hotels?.data?.map((hotel: any) => (
									<Grid.Col xs={12} md={6} xl={3} key={hotel.id}>
										<PartnerCard>
											<PartnerName>{hotel.name}</PartnerName>
											<PartnerPhone>
												<Flex direction='column'>
													<b>Phone:</b>
													{hotel.contactPhone || "-"}
												</Flex>
											</PartnerPhone>
											<PartnerEmail>
												<Flex direction='column'>
													<b>Email:</b>
													{hotel.contactEmail || "-"}
												</Flex>
											</PartnerEmail>
										</PartnerCard>
									</Grid.Col>
								))}
							</>
						) : (
							<Flex justify='center' align='center' mih={200} w='100%'>
								<Loader />
							</Flex>
						)}
					</Grid>
					<PageSubtitle>Merchants</PageSubtitle>
					<Grid mb={20}>
						{merchants?.data ? (
							<>
								{merchants?.data?.map((merchant: any) => (
									<Grid.Col xs={12} md={6} xl={3} key={merchant.id}>
										<PartnerCard>
											<PartnerName>{merchant.name}</PartnerName>
											<PartnerPhone>
												<Flex direction='column'>
													<b>Phone:</b>
													{merchant.contactPhone || "-"}
												</Flex>
											</PartnerPhone>
											<PartnerEmail>
												<Flex direction='column'>
													<b>Email:</b>
													{merchant.contactEmail || "-"}
												</Flex>
											</PartnerEmail>
											<PartnerMealPeriod>
												<Flex direction='column'>
													<b>Meal Periods:</b>
													{merchant?.mealPeriods?.length ? (
														<List>
															{orderBy(merchant?.mealPeriods, "startHour")?.map(
																(mealPeriod: any) => {
																	const {
																		mealPeriodStartTimeString,
																		mealPeriodEndTimeString
																	} = getMealPeriodWorkingHours({
																		timezone: merchant?.timezone,
																		startHour: mealPeriod?.startHour,
																		endHour: mealPeriod?.endHour
																	})
																	return (
																		<List.Item
																			key={mealPeriod?.id}
																		>{`${mealPeriod?.name}: ${mealPeriodStartTimeString} - ${mealPeriodEndTimeString}`}</List.Item>
																	)
																}
															)}
														</List>
													) : (
														"-"
													)}
												</Flex>
											</PartnerMealPeriod>
										</PartnerCard>
									</Grid.Col>
								))}
							</>
						) : (
							<Flex justify='center' align='center' mih={200} w='100%'>
								<Loader />
							</Flex>
						)}
					</Grid>
				</Flex>
			}
		/>
	)
}

export default Dashboard
