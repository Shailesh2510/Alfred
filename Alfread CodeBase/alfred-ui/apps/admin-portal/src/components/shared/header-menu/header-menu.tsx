import { Flex, Image, Menu, Tooltip } from "@mantine/core"
import {
	HeaderLogo,
	StyledHeader,
	ProfileSection,
	MerchantName,
	MerchantRole,
	ProfileInfo,
	ProfileImage,
	ImpersonateContainer,
	PendingOrders
} from "./header-menu.style"
import { IconLogout } from "@tabler/icons-react"
import { StyledButton, StyledSelect } from "@/design-components"
import useHotels from "@/hooks/hotel/useHotels"
import useMerchants from "@/hooks/merchant/useMerchants"
import {
	ORDER_CHANNEL,
	ORDER_CREATED_EVENT,
	ORDER_STATUS,
	ORDER_STATUS_UPDATED_EVENT,
	REPLICATE_MENU_CHANNEL,
	REPLICATE_MENU_EVENT
} from "@/shared-constants"
import Pusher from "pusher-js"
import { modals } from "@mantine/modals"
import { customNotification } from "@/shared-utils"
import { useEffect, useMemo, useState } from "react"
import { map, orderBy } from "lodash"
import { getCookie } from "@/shared-utils"
import { useBreakPoints } from "@/shared-hooks"
import useOrders from "@/hooks/order/useOrders"
import Link from "next/link"

const PENDING_ORDERS_ALERT_INTERVAL = 2000

const HeaderMenu = ({ user, signOut }: any) => {
	const hotels = useHotels()
	const merchants = useMerchants()
	const { lg } = useBreakPoints()
	const { data: orders, refetch: refetchOrders } = useOrders(
		{
			page: 1,
			status: ORDER_STATUS.PENDING.value
		},
		{ enabled: false }
	)
	const [impersonatedHotel, setImpersonatedHotel] = useState<any>(null)
	const [impersonatedMerchant, setImpersonatedMerchant] = useState<any>(null)

	const alertNotificationSound = new Audio("/alert.wav")

	const pendingOrders = useMemo(
		() =>
			orders?.data?.filter(
				(order: any) => order.status === ORDER_STATUS.PENDING.value
			),
		[orders?.data]
	)

	useEffect(() => {
		if (typeof localStorage !== "undefined") {
			const impersonatedHotel = getCookie("impersonatedHotel")
			const impersonatedMerchant = getCookie("impersonatedMerchant")
			if (impersonatedHotel) {
				setImpersonatedHotel(impersonatedHotel)
			}
			if (impersonatedMerchant) {
				setImpersonatedMerchant(impersonatedMerchant)
			}
		}
	}, [])

	const hotelOptions: any = useMemo(
		() =>
			orderBy(
				map(hotels?.data?.data, (hotel: any) => ({
					value: hotel?.id,
					label: hotel?.name
				})),
				"label"
			),
		[merchants]
	)
	const merchantOptions: any = useMemo(
		() =>
			orderBy(
				map(merchants?.data?.data, (merchant: any) => ({
					value: merchant?.id,
					label: merchant?.name
				})),
				"label"
			),
		[merchants]
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
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(REPLICATE_MENU_CHANNEL)
		channel.bind(REPLICATE_MENU_EVENT, (response: any) => {
			response?.data?.forEach((result: { status: string; hotel: string }) => {
				if (result.status === "SUCCESS") {
					customNotification.success({
						title: "Menu Replication",
						message: `Menu successfully replicated to ${result.hotel}.`
					})
				} else {
					customNotification.error({
						title: "Menu Replication",
						message: `Menu replication failed for ${result.hotel}. Please try again.`
					})
				}
			})
		})

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
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
				<Image
					src='/get-alfred-logo.png'
					alt='get alfred'
					height={lg ? "auto" : 36}
					width={lg ? 50 : "auto"}
				/>
			</HeaderLogo>
			<Flex>
				<ImpersonateContainer>
					<StyledSelect
						clearable
						label='Impersonate hotel'
						value={parseInt(impersonatedHotel)}
						data={hotelOptions}
						onChange={(value: any) => {
							const date = new Date()
							const expiresIn = date.setDate(date.getDate() + 1)
							if (typeof window !== "undefined") {
								if (value) {
									setImpersonatedHotel(value)
									document.cookie = `impersonatedHotel=${value}; expires=${expiresIn}; domain=.getalfred.com; path=/; SameSite=Strict; Secure;`
								} else {
									setImpersonatedHotel(null)
									document.cookie = `impersonatedHotel=; expires=${expiresIn}; domain=.getalfred.com; path=/; SameSite=None; Secure;`
								}
							}
						}}
					/>
					<StyledSelect
						clearable
						label='Impersonate merchant'
						value={parseInt(impersonatedMerchant)}
						data={merchantOptions}
						onChange={(value: any) => {
							const date = new Date()
							const expiresIn = date.setDate(date.getDate() + 1)
							if (typeof window !== "undefined") {
								if (value) {
									setImpersonatedMerchant(value)
									document.cookie = `impersonatedMerchant=${value}; expires=${expiresIn}; domain=.getalfred.com; path=/; SameSite=None; Secure;`
								} else {
									setImpersonatedMerchant(null)
									document.cookie = `impersonatedMerchant=; expires=${expiresIn}; domain=.getalfred.com; path=/; SameSite=None; Secure;`
								}
							}
						}}
					/>
				</ImpersonateContainer>

				{pendingOrders?.length > 0 && (
					<Tooltip label={`${pendingOrders?.length} pending orders`}>
						<Link href='/kds' style={{ textDecoration: "none" }}>
							<PendingOrders>{pendingOrders?.length}</PendingOrders>
						</Link>
					</Tooltip>
				)}

				<ProfileSection>
					<ProfileInfo>
						<MerchantName>{user?.attributes?.email}</MerchantName>
						<MerchantRole>Admin</MerchantRole>
					</ProfileInfo>
					<Menu width={200} shadow='xl' withArrow trigger='hover'>
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
			</Flex>
		</StyledHeader>
	)
}

export default HeaderMenu
