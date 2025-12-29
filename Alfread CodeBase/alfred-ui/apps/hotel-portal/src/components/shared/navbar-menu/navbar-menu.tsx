import {
	IconFileText,
	IconLayoutDashboard,
	IconCar,
	IconTag,
	IconToolsKitchen2,
	IconCurrencyDollar
} from "@tabler/icons-react"
import {
	NavbarMenuItem,
	StyledNavbar,
	NavbarMenuContainer,
	NavbarMenuItemIcon,
	NavbarMenuItemText,
	NavbarMobileLabel,
	NavbarMobileContainer,
	StyledLink
} from "./navbar-menu.style"
import { useRouter } from "next/router"
import { useBreakPoints } from "@/shared-hooks"
import { Flex } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { StyledBadge } from "@/design-components"
import { useNavbarStore } from "../global-store/NavbarStore"
import useRideStore from "@/components/carmel/store/useRideStore"

const ICON_SIZE = 22

const getNavbarItems = (user: any) => {
	const navbarItems = [
		{
			id: 1,
			label: "Dashboard",
			mobileLabel: "Dashboard",
			link: "/",
			icon: <IconLayoutDashboard size={ICON_SIZE} />
		},
		{
			id: 2,
			label: "Active Orders",
			mobileLabel: "Status Tracker",
			link: "/active-orders",
			icon: <IconFileText size={ICON_SIZE} />
		},
		// {
		// 	id: 3,
		// 	label: "Order List",
		// 	link: "/order-list",
		// 	icon: <IconChartPie size={ICON_SIZE} />
		// },
		// {
		// 	id: 4,
		// 	label: "Menu",
		// 	mobileLabel: "Menu",
		// 	link: "/menu",
		// 	icon: <IconSoup size={ICON_SIZE} />
		// },
		// {
		// 	id: 5,
		// 	label: "Vouchers",
		// 	link: "/vouchers",
		// 	icon: <IconTag size={ICON_SIZE} />
		// },
		{
			id: 6,
			label: "Rides",
			mobileLabel: "Book a Ride",
			link: "/rides",
			icon: <IconCar size={ICON_SIZE} />
		},
		{
			id: 7,
			label: "In-Room Dining",
			mobileLabel: "In-Room Dining",
			link: "/roomService",
			icon: <IconToolsKitchen2 size={ICON_SIZE} />
		},
		{
			id: 8,
			label: "Commissions",
			mobileLabel: "Commissions",
			link: "/commissions",
			icon: <IconCurrencyDollar size={ICON_SIZE} />
		}
	]

	if (user?.attributes?.email === "admin@getalfred.com") {
		navbarItems.push({
			id: 5,
			label: "Vouchers",
			mobileLabel: "Vouchers",
			link: "/vouchers",
			icon: <IconTag size={ICON_SIZE} />
		})
	} else {
		console.log("Not an Admin!")
	}

	return navbarItems
}

const NavbarMenu = ({ user }: any) => {
	const { pathname } = useRouter()
	const { lg } = useBreakPoints()
	const isMobile = useMediaQuery("(max-width: 1200px)")
	const { isNavbarOpen } = useNavbarStore()
	const { resetCheckoutFormValue, resetRideFormValue } = useRideStore()
	const navbarItems = getNavbarItems(user)

	return (
		<StyledNavbar lg={!isMobile && lg} isOpen={isNavbarOpen}>
			<Flex justify='center'>
				<StyledBadge p={12} mb={8}>
					{"HOTEL"}
				</StyledBadge>
			</Flex>
			{navbarItems.map(item => (
				<NavbarMenuContainer key={item.id}>
					<StyledLink
						href={item.link}
						onClick={() => {
							resetRideFormValue()
							resetCheckoutFormValue()
						}}
					>
						<NavbarMenuItem>
							<NavbarMobileContainer>
								<NavbarMenuItemIcon
									active={
										pathname.split("/")?.[1] === item.link.split("/")?.[1]
									}
								>
									{item.icon}
								</NavbarMenuItemIcon>
								{isMobile && (
									<NavbarMobileLabel
										active={
											pathname.split("/")?.[1] === item.link.split("/")?.[1]
										}
									>
										{item.mobileLabel}
									</NavbarMobileLabel>
								)}
							</NavbarMobileContainer>
							{!isMobile && !lg && (
								<NavbarMenuItemText
									active={
										pathname.split("/")?.[1] === item.link.split("/")?.[1]
									}
								>
									{item.label}
								</NavbarMenuItemText>
							)}
						</NavbarMenuItem>
					</StyledLink>
				</NavbarMenuContainer>
			))}
		</StyledNavbar>
	)
}

export default NavbarMenu
