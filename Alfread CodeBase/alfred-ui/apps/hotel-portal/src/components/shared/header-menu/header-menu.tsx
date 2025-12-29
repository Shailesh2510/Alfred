import { Image, Menu } from "@mantine/core"
import { StyledButton } from "@/design-components"
import { Tooltip } from "@mantine/core"
import useCurrentHotel from "@/hooks/me/useCurrentHotel"
import {
	HeaderLogo,
	StyledHeader,
	ProfileSection,
	MerchantName,
	MerchantRole,
	ProfileInfo,
	ProfileImage,
	CurrentHotel,
	MainMenu,
	HamburgerButton,
	MobileFlex,
	MobileProfileInfo
} from "./header-menu.style"
import { useBreakPoints } from "@/shared-hooks"
import { IconLogout, IconMenu2 } from "@tabler/icons-react"
import { useEffect } from "react"
import useRideStore from "@/components/carmel/store/useRideStore"
import { useMediaQuery } from "@mantine/hooks"
import { useNavbarStore } from "../global-store/NavbarStore"

const HeaderMenu = ({ user, signOut }: any) => {
	const { data: currentHotel } = useCurrentHotel()

	const { lg } = useBreakPoints()
	const isMobile = useMediaQuery("(max-width: 1200px)")
	const { toggleNavbar, setIsNavbarOpen } = useNavbarStore()
	const { setCurrentHotelDetails, currentHotelDetails } = useRideStore()

	useEffect(() => {
		if (!currentHotelDetails) {
			setCurrentHotelDetails(currentHotel?.data?.[0])
		}
	}, [currentHotel])

	useEffect(() => {
		if (isMobile) {
			setIsNavbarOpen(false)
		}
	}, [isMobile])

	return (
		<StyledHeader height={70}>
			<HeaderLogo lg={lg}>
				<MobileFlex>
					<Image
						src='/get-alfred-logo.png'
						alt='get alfred'
						height={lg ? "auto" : 36}
						width={lg ? 50 : "auto"}
					/>
					{isMobile && (
						<HamburgerButton onClick={toggleNavbar} type='button'>
							<IconMenu2 size={24} />
						</HamburgerButton>
					)}
				</MobileFlex>
			</HeaderLogo>
			<MainMenu>
				<Tooltip
					label={currentHotel?.data?.[0]?.name}
					position='bottom'
					disabled={!isMobile && currentHotel?.data?.[0]?.name?.length <= 30}
				>
					<CurrentHotel>{currentHotel?.data?.[0]?.name}</CurrentHotel>
				</Tooltip>
			</MainMenu>
			<ProfileSection>
				{!isMobile && (
					<ProfileInfo>
						<MerchantName>{user?.attributes?.email}</MerchantName>
						<MerchantRole>Hotel</MerchantRole>
					</ProfileInfo>
				)}
				<Menu
					width={200}
					shadow='xl'
					withArrow
					trigger={isMobile ? "click" : "hover"}
				>
					<Menu.Target data-cy='header-menu-avatar'>
						<ProfileImage
							src='/hotel.jpeg'
							fit='cover'
							radius={40}
							width={40}
							height={40}
						/>
					</Menu.Target>
					<Menu.Dropdown mih={80} p={20}>
						{isMobile && (
							<>
								<MobileProfileInfo>
									<MerchantName>{user?.attributes?.email}</MerchantName>
									<MerchantRole>Hotel</MerchantRole>
								</MobileProfileInfo>
								<Menu.Divider />
							</>
						)}
						<StyledButton
							fullWidth
							leftIcon={<IconLogout size={20} />}
							onClick={() => signOut()}
						>
							Sign Out
						</StyledButton>
					</Menu.Dropdown>
				</Menu>
			</ProfileSection>
		</StyledHeader>
	)
}

export default HeaderMenu
