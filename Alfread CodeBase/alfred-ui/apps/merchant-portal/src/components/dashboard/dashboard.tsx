import { PageStructure } from "@/shared-components"
import {
	WelcomeMessage,
	PageSubtitle,
	PartnerCard,
	PartnerName,
	PartnerEmail,
	PartnerMealPeriod,
	PartnerPhone
} from "./dashboard.style"
import { Flex, Grid, List, Loader } from "@mantine/core"
import { orderBy } from "lodash"
import { getMealPeriodWorkingHours } from "@/shared-utils"

const Dashboard = () => {
	const hotels = { data: [] }
	return (
		<PageStructure
			pageContent={
				<Flex p={20} direction='column'>
					<WelcomeMessage>Welcome to Get Alfred merchant app</WelcomeMessage>
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
											<PartnerMealPeriod>
												<Flex direction='column'>
													<b>Meal Periods:</b>
													{hotel?.mealPeriods?.length ? (
														<List>
															{orderBy(hotel?.mealPeriods, "startHour")?.map(
																(mealPeriod: any) => {
																	const {
																		mealPeriodStartTimeString,
																		mealPeriodEndTimeString
																	} = getMealPeriodWorkingHours({
																		timezone: mealPeriod?.timezone,
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
					<PageSubtitle>Support</PageSubtitle>
					<Grid mb={20}>
						<Grid.Col xs={12} md={6} xl={3}>
							<PartnerCard>
								<PartnerName>Alfred Ltd</PartnerName>
								<PartnerPhone>
									<Flex direction='column'>
										<b>Phone:</b>
										+1 844-738-0342
									</Flex>
								</PartnerPhone>
								<PartnerEmail>
									<Flex direction='column'>
										<b>Email:</b>
										info@getalfred.com
									</Flex>
								</PartnerEmail>
							</PartnerCard>
						</Grid.Col>
					</Grid>
				</Flex>
			}
		/>
	)
}

export default Dashboard
