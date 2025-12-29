import {
	IconSoup,
	IconLayoutDashboard,
	IconChartPie,
	IconFileText
} from "@tabler/icons-react"
import {
	StyledLink,
	StyledNavbar,
	NavbarMenuItem,
	NavbarMenuContainer,
	NavbarMenuItemIcon,
	NavbarMenuItemText,
	NavbarMobileLabel,
	NavbarMobileContainer
} from "./navbar-menu.style"
import { useRouter } from "next/router"
import { useBreakPoints } from "@/shared-hooks"
import { StyledBadge } from "@/design-components"
import { Flex } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useNavbarStore } from "../global-store/NavbarStore"

const ICON_SIZE = 22

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
		label: "KDS",
		mobileLabel: "Kitchen Display",
		link: "/kds",
		icon: <IconFileText size={ICON_SIZE} />
	},
	{
		id: 3,
		label: "Products",
		mobileLabel: "Menu Items",
		link: "/products",
		icon: <IconSoup size={ICON_SIZE} />
	},
	{
		id: 4,
		label: "Order list",
		mobileLabel: "Orders",
		link: "/order-list",
		icon: <IconChartPie size={ICON_SIZE} />
	}
]

const NavbarMenu = () => {
	const { pathname } = useRouter()
	const { lg } = useBreakPoints()
	const isMobile = useMediaQuery("(max-width: 1200px)")
	const { isNavbarOpen } = useNavbarStore()

	return (
		<StyledNavbar lg={!isMobile && lg} isOpen={isNavbarOpen}>
			<Flex justify='center'>
				<StyledBadge p={12} mb={8}>
					MERCHANT
				</StyledBadge>
			</Flex>
			{navbarItems.map(item => (
				<NavbarMenuContainer key={item.id}>
					<StyledLink href={item.link}>
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
