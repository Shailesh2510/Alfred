import { Image, Menu, Tooltip } from "@mantine/core"
import { StyledButton } from "@/design-components"
import useCurrentMerchant from "@/hooks/me/useCurrentMerchant"
import { IconLogout, IconMenu2, IconUserCircle } from "@tabler/icons-react"
import {
	HeaderLogo,
	StyledHeader,
	MainMenu,
	ProfileSection,
	MerchantName,
	MerchantRole,
	ProfileInfo,
	CurrentMerchant,
	PendingOrders,
	HamburgerButton,
	MobileFlex,
	MobileProfileInfo
} from "./header-menu.style"
import { useBreakPoints } from "@/shared-hooks"
import useCurrentOrders from "@/hooks/order/useCurrentOrders"
import { useMediaQuery } from "@mantine/hooks"
import { useNavbarStore } from "../global-store/NavbarStore"
import { useEffect, useMemo } from "react"
import {
	ORDER_CANCELED_EVENT,
	ORDER_CHANNEL,
	ORDER_CREATED_EVENT,
	ORDER_STATUS,
	ORDER_STATUS_UPDATED_EVENT
} from "@/shared-constants"
import Pusher from "pusher-js"
import { modals } from "@mantine/modals"
import { customNotification } from "@/shared-utils"
import Link from "next/link"

const PENDING_ORDERS_ALERT_INTERVAL = 2000

const HeaderMenu = ({ user, signOut }: any) => {
	const alertNotificationSound = new Audio("/alert.wav")

	const { lg } = useBreakPoints()
	const { data: currentMerchant } = useCurrentMerchant()

	const { data: orders, refetch: refetchOrders } = useCurrentOrders()

	const isMobile = useMediaQuery("(max-width: 1200px)")
	const { toggleNavbar, setIsNavbarOpen } = useNavbarStore()

	useEffect(() => {
		if (isMobile) {
			setIsNavbarOpen(false)
		}
		return () => {
			setIsNavbarOpen(false)
		}
	}, [isMobile])

	const pendingOrders = useMemo(
		() =>
			orders?.data?.filter(
				(order: any) => order.status === ORDER_STATUS.PENDING.value
			),
		[orders?.data]
	)

	useEffect(() => {
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(ORDER_CHANNEL)

		channel.bind(ORDER_STATUS_UPDATED_EVENT, (event: any) => {
			if (event?.status === ORDER_STATUS.CANCELED.value && event?.id) {
				modals.openContextModal({
					modal: "confirm",
					title: "Order canceled",
					innerProps: {
						modalBody: `Order with the id: ${event?.nonce} was canceled`
					}
				})
			}
			refetchOrders()
		})
		channel.bind(ORDER_CANCELED_EVENT, () => {
			refetchOrders()
		})
		channel.bind(ORDER_CREATED_EVENT, (event: any) => {
			if (event?.status === ORDER_STATUS.PENDING.value && event?.id) {
				alertNotificationSound.play()
				customNotification.success({
					autoClose: 5000,
					title: "New order",
					message: `New order with the id: ${event?.nonce}`
				})
			}
			refetchOrders()
		})

		return () => {
			channel.unbind_all()
			channel.disconnect()
			pusher.unbind_all()
			pusher.disconnect()
		}
	}, [])

	useEffect(() => {
		if (pendingOrders?.length > 0) {
			const alertInterval = setInterval(() => {
				alertNotificationSound.play()
			}, PENDING_ORDERS_ALERT_INTERVAL)

			return () => {
				clearInterval(alertInterval)
			}
		}
		return undefined
	}, [pendingOrders])

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
					label={currentMerchant?.data?.[0]?.name}
					position='bottom'
					disabled={!isMobile && currentMerchant?.data?.[0]?.name?.length <= 30}
				>
					<CurrentMerchant>{currentMerchant?.data?.[0]?.name}</CurrentMerchant>
				</Tooltip>
			</MainMenu>
			{pendingOrders?.length !== 0 && (
				<Tooltip label={`${pendingOrders?.length} pending orders`}>
					<Link href='/kds' style={{ textDecoration: "none" }}>
						<PendingOrders>{pendingOrders?.length}</PendingOrders>
					</Link>
				</Tooltip>
			)}
			<ProfileSection>
				{!isMobile && (
					<ProfileInfo>
						<MerchantName>{user?.attributes?.email}</MerchantName>
						<MerchantRole>Merchant</MerchantRole>
					</ProfileInfo>
				)}
				<Menu
					width={200}
					shadow='xl'
					withArrow
					trigger={isMobile ? "click" : "hover"}
				>
					<Menu.Target data-cy='header-menu-avatar'>
						<IconUserCircle size={32} />
					</Menu.Target>
					<Menu.Dropdown mih={80} p={20}>
						{isMobile && (
							<>
								<MobileProfileInfo>
									<MerchantName>{user?.attributes?.email}</MerchantName>
									<MerchantRole>Merchant</MerchantRole>
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
