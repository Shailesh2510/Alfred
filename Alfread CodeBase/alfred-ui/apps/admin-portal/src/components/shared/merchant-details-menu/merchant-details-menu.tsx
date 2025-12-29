import { Flex, Tabs } from "@mantine/core"
import { useRouter } from "next/router"
import { useInputState } from "@mantine/hooks"
import { useEffect } from "react"

const MerchantDetailsMenu = ({ merchantId }: any) => {
	const router = useRouter()

	const [currentTab, setCurrentTab] = useInputState("details")

	useEffect(() => {
		const path = router.pathname?.split("/")?.[3]
		if (path === "products") {
			setCurrentTab("products")
		} else if (path === "modifiers") {
			setCurrentTab("modifiers")
		} else if (path === "meal-periods") {
			setCurrentTab("meal-periods")
		} else if (path === "status") {
			setCurrentTab("status")
		} else if (path === "hotel") {
			setCurrentTab("hotel")
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
						onClick={() => router.push(`/merchants/${merchantId}`)}
					>
						Details
					</Tabs.Tab>
					<Tabs.Tab
						value='meal-periods'
						onClick={() => router.push(`/merchants/${merchantId}/meal-periods`)}
					>
						Meal Periods
					</Tabs.Tab>
					<Tabs.Tab
						value='modifiers'
						onClick={() => router.push(`/merchants/${merchantId}/modifiers`)}
					>
						Modifiers
					</Tabs.Tab>
					<Tabs.Tab
						value='products'
						onClick={() => router.push(`/merchants/${merchantId}/products`)}
					>
						Products
					</Tabs.Tab>
					<Tabs.Tab
						value='status'
						onClick={() => router.push(`/merchants/${merchantId}/status`)}
					>
						Status
					</Tabs.Tab>
					<Tabs.Tab
						value='hotel'
						onClick={() => router.push(`/merchants/${merchantId}/hotel`)}
					>
						Hotel
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>
		</Flex>
	)
}

export default MerchantDetailsMenu
