/* eslint-disable no-unused-vars */
import { useEffect, useMemo } from "react"
import { LastUpdatedAgo, PageStructure } from "@/shared-components"
import { Flex, Grid, Loader, Accordion, Badge } from "@mantine/core"
import {
	NoOrdersMessage,
	OrdersColumnContainer,
	OrdersColumnHeader,
	OrdersContainer,
	StyledGrid
} from "./active-orders.style"
import { StyledSearch } from "@/design-components"
import useCurrentOrders from "@/hooks/order/useCurrentOrders"
import { MERCHANT_TYPE_RIDES, ORDER_STATUS } from "@/shared-constants"
import OrderItem from "./components/order-item"
import { useInputState, useMediaQuery } from "@mantine/hooks"
import { filter } from "lodash"
import Pusher from "pusher-js"
import {
	ORDER_CANCELED_EVENT,
	ORDER_CHANNEL,
	ORDER_CREATED_EVENT,
	ORDER_STATUS_UPDATED_EVENT
} from "@/shared-constants"
import { formatInTimeZone } from "date-fns-tz"

const getStatusLabel = (status: string) => {
	if (status === "preparation") {
		return "Waiting for Pickup"
	}
	if (status === "indelivery") {
		return "In Delivery"
	}
	return status.charAt(0).toUpperCase() + status.slice(1)
}

const renderOrder = (order: any) => {
	return (
		<OrderItem
			key={order?.id}
			merchantType={order?.merchantType}
			isPaid={order?.isPaid}
			paymentType={order?.orderType}
			orderId={order?.id}
			orderNonce={order?.nonce}
			roomName={order?.roomNumber}
			clientName={order?.clientName}
			grandTotal={order?.grandTotal}
			merchantName={order?.merchantName}
			ambassadorName={order?.ambassadorName}
			orderTime={formatInTimeZone(
				order?.merchantType === MERCHANT_TYPE_RIDES
					? order?.scheduledDate
					: order?.orderDate,
				"America/New_York",
				"MM/dd h:mm a"
			)}
		/>
	)
}

const ActiveOrders = () => {
	const [orderIdFilter, setOrderIdFilter] = useInputState<string>("")
	const [clientNameFilter, setClientNameFilter] = useInputState<string>("")
	const [orderRoomFilter, setOrderRoomFilter] = useInputState<string>("")
	const [lastUpdatedTime, setLastUpdatedTime] = useInputState(new Date())
	const isMobile = useMediaQuery("(max-width: 1200px)")
	const {
		data: orders,
		isLoading: ordersLoading,
		refetch: refetchOrders
	} = useCurrentOrders({
		onSuccess: () => {
			setLastUpdatedTime(new Date())
		}
	})

	useEffect(() => {
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(ORDER_CHANNEL)
		channel.bind(ORDER_STATUS_UPDATED_EVENT, () => {
			refetchOrders()
		})
		channel.bind(ORDER_CANCELED_EVENT, () => {
			refetchOrders()
		})
		channel.bind(ORDER_CREATED_EVENT, () => {
			refetchOrders()
		})

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [])

	const ordersData = orders?.data

	const sortedOrders = useMemo(
		() => ({
			scheduled: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.SCHEDULED.value
			),
			pending: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.PENDING.value
			),
			confirmed: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.CONFIRMED.value
			),
			preparation: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.PREPARATION.value
			),
			indelivery: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.IN_DELIVERY.value
			),
			delivered: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.DELIVERED.value
			),
			canceled: filter(
				ordersData,
				(order: any) => order?.status === ORDER_STATUS.CANCELED.value
			)
		}),
		[ordersData]
	)

	let filteredOrders = sortedOrders

	if (orderIdFilter) {
		filteredOrders = {
			scheduled: filter(filteredOrders?.scheduled, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			pending: filter(filteredOrders?.pending, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			confirmed: filter(filteredOrders?.confirmed, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			preparation: filter(filteredOrders?.preparation, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			indelivery: filter(filteredOrders?.indelivery, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			delivered: filter(filteredOrders?.delivered, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			),
			canceled: filter(filteredOrders?.canceled, (order: any) =>
				order?.id.toString().includes(orderIdFilter)
			)
		}
	}

	if (clientNameFilter) {
		filteredOrders = {
			scheduled: filter(filteredOrders?.scheduled, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			pending: filter(filteredOrders?.pending, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			confirmed: filter(filteredOrders?.confirmed, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			preparation: filter(filteredOrders?.preparation, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			indelivery: filter(filteredOrders?.indelivery, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			delivered: filter(filteredOrders?.delivered, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			),
			canceled: filter(filteredOrders?.canceled, (order: any) =>
				order?.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
			)
		}
	}

	if (orderRoomFilter) {
		filteredOrders = {
			scheduled: filter(filteredOrders?.scheduled, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			pending: filter(filteredOrders?.pending, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			confirmed: filter(filteredOrders?.confirmed, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			preparation: filter(filteredOrders?.preparation, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			indelivery: filter(filteredOrders?.indelivery, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			delivered: filter(filteredOrders?.delivered, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			),
			canceled: filter(filteredOrders?.canceled, (order: any) =>
				order?.roomNumber.toLowerCase().includes(orderRoomFilter.toLowerCase())
			)
		}
	}

	const handleRefreshClick = () => {
		refetchOrders()
		setLastUpdatedTime(new Date())
	}
	const visibleStatuses = Object.entries(filteredOrders).filter(
		([status]) => status !== "confirmed"
	)

	const renderMobileOrders = () => (
		<Accordion defaultValue='scheduled'>
			{visibleStatuses.map(([status, orders]) => (
				<Accordion.Item key={status} value={status}>
					<Accordion.Control>
						<Flex justify='space-between' align='center'>
							{getStatusLabel(status)}
							<Badge color='blue'>{(orders as any[]).length}</Badge>
						</Flex>
					</Accordion.Control>
					<Accordion.Panel>
						{(orders as any[]).length > 0 ? (
							orders.map((order: any) => renderOrder(order))
						) : (
							<NoOrdersMessage>No orders found</NoOrdersMessage>
						)}
					</Accordion.Panel>
				</Accordion.Item>
			))}
		</Accordion>
	)

	const renderDesktopOrders = () => (
		<StyledGrid gutter={0}>
			{visibleStatuses.map(([status, orders]) => (
				<Grid.Col key={status} sm={12} md='auto'>
					<OrdersColumnContainer>
						<OrdersColumnHeader>
							<Flex justify='space-between' align='center'>
								{getStatusLabel(status)}
								<Badge color='blue'>{(orders as any[]).length}</Badge>
							</Flex>
						</OrdersColumnHeader>
						<OrdersContainer>
							{(orders as any[]).length > 0 ? (
								orders.map((order: any) => renderOrder(order))
							) : (
								<NoOrdersMessage>No orders found</NoOrdersMessage>
							)}
						</OrdersContainer>
					</OrdersColumnContainer>
				</Grid.Col>
			))}
		</StyledGrid>
	)

	return (
		<PageStructure
			title='Orders'
			headerContent={
				!isMobile ? (
					<Flex gap={16} m={6}>
						<LastUpdatedAgo
							refetchOnClick={handleRefreshClick}
							lastUpdatedTime={lastUpdatedTime}
						/>
						{/* <StyledSearch
						value={orderIdFilter}
						onChange={setOrderIdFilter}
						placeholder='Search for orders'
					/>
					<StyledSearch
						value={orderRoomFilter}
						onChange={setOrderRoomFilter}
						placeholder='Search for rooms'
					/> */}
						<StyledSearch
							value={clientNameFilter}
							sx={{ width: "auto" }}
							onChange={setClientNameFilter}
							placeholder='Search for clients'
						/>
					</Flex>
				) : null
			}
			pageContent={
				<>
					{isMobile ? (
						<Flex
							p={8}
							sx={{
								display: "grid",
								flexDirection: "column",
								borderBottom: "2px solid #ADB5BD",
								alignItems: "center",
								justifyContent: "center"
							}}
						>
							<LastUpdatedAgo
								refetchOnClick={handleRefreshClick}
								lastUpdatedTime={lastUpdatedTime}
							/>
							{/* <StyledSearch
						value={orderIdFilter}
						onChange={setOrderIdFilter}
						placeholder='Search for orders'
					/>
					<StyledSearch
						value={orderRoomFilter}
						onChange={setOrderRoomFilter}
						placeholder='Search for rooms'
					/> */}
							<Flex sx={{ width: "300px" }}>
								<StyledSearch
									value={clientNameFilter}
									onChange={setClientNameFilter}
									placeholder='Search for clients'
								/>
							</Flex>
						</Flex>
					) : null}
					{ordersLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>{isMobile ? renderMobileOrders() : renderDesktopOrders()}</>
					)}
				</>
			}
		/>
	)
}

export default ActiveOrders
