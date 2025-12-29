import { Flex, Tabs } from "@mantine/core"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useInputState } from "@mantine/hooks"

const HotelDetailsMenu = ({ hotelId }: any) => {
	const router = useRouter()

	const [currentTab, setCurrentTab] = useInputState("details")

	useEffect(() => {
		const path = router.pathname?.split("/")?.[3]
		if (path === "merchants") {
			setCurrentTab("merchants")
		} else if (path === "menu") {
			setCurrentTab("menu")
		} else {
			setCurrentTab("details")
		}
	}, [router.pathname])

	return (
		<Flex align='center' justify='center' gap={16} mt={16}>
			<Tabs value={currentTab} onChange={setCurrentTab}>
				<Tabs.List>
					<Tabs.Tab
						value='details'
						onClick={() => router.push(`/hotels/${hotelId}`)}
					>
						Details
					</Tabs.Tab>
					<Tabs.Tab
						value='merchants'
						onClick={() => router.push(`/hotels/${hotelId}/merchants`)}
					>
						Merchants
					</Tabs.Tab>
					<Tabs.Tab
						value='menu'
						onClick={() => router.push(`/hotels/${hotelId}/menu`)}
					>
						Menu
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>
		</Flex>
	)
}

export default HotelDetailsMenu
