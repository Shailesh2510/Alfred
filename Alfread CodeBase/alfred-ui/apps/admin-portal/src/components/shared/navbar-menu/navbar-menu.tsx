import {
	IconChefHat,
	IconBuildingSkyscraper,
	IconUser,
	IconChartPie,
	IconTag,
	IconLayoutDashboard,
	IconFileText
} from "@tabler/icons-react"
import {
	StyledLink,
	StyledNavbar,
	NavbarMenuItem,
	NavbarMenuContainer,
	NavbarMenuItemIcon,
	NavbarMenuItemText
} from "./navbar-menu.style"
import { useRouter } from "next/router"
import { useBreakPoints } from "@/shared-hooks"
import { StyledBadge } from "@/design-components"
import { Flex } from "@mantine/core"

const ICON_SIZE = 22

const navbarItems = [
	{
		id: 1,
		label: "Dashboard",
		link: "/",
		icon: <IconLayoutDashboard size={ICON_SIZE} />
	},
	{
		id: 2,
		label: "Hotels",
		link: "/hotels",
		icon: <IconBuildingSkyscraper size={ICON_SIZE} />
	},
	{
		id: 3,
		label: "Merchants",
		link: "/merchants",
		icon: <IconChefHat size={ICON_SIZE} />
	},
	{
		id: 4,
		label: "Vouchers",
		link: "/vouchers",
		icon: <IconTag size={ICON_SIZE} />
	},
	{
		id: 5,
		label: "KDS",
		link: "/kds",
		icon: <IconFileText size={ICON_SIZE} />
	},
	{
		id: 6,
		label: "Order list",
		link: "/order-list",
		icon: <IconChartPie size={ICON_SIZE} />
	},
	{
		id: 7,
		label: "Users",
		link: "/users",
		icon: <IconUser size={ICON_SIZE} />
	}
]

const NavbarMenu = () => {
	const { pathname } = useRouter()
	const { lg } = useBreakPoints()

	return (
		<StyledNavbar lg={lg}>
			<Flex justify='center'>
				<StyledBadge p={12} mb={8}>
					ADMIN
				</StyledBadge>
			</Flex>
			{navbarItems.map(item => (
				<NavbarMenuContainer key={item.id}>
					<StyledLink href={item.link}>
						<NavbarMenuItem>
							<NavbarMenuItemIcon
								active={pathname.split("/")?.[1] === item.link.split("/")?.[1]}
							>
								{item.icon}
							</NavbarMenuItemIcon>
							{!lg && (
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
