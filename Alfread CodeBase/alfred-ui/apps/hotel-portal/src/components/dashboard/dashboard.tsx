import { PageStructure } from "@/shared-components"
import {
	WelcomeMessage,
	PageSubtitle,
	PartnerName,
	PartnerEmail,
	PartnerCard,
	PartnerPhone
} from "./dashboard.style"
import { Flex, Grid } from "@mantine/core"

const Dashboard = () => {
	return (
		<PageStructure
			pageContent={
				<Flex p={20} direction='column'>
					<WelcomeMessage>Welcome to Get Alfred hotel app</WelcomeMessage>
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
