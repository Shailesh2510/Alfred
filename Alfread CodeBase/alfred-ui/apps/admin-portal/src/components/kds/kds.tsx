import React, { useEffect, useState, useCallback, useMemo } from "react"
import { LastUpdatedAgo, PageStructure } from "@/shared-components"
import {
	ORDER_CHANNEL,
	ORDER_CREATED_EVENT,
	ORDER_STATUS,
	ORDER_STATUS_UPDATED_EVENT,
	OrderStatusType
} from "@/shared-constants"
import { useQueryString } from "@/shared-hooks"
import { Flex, Grid, Loader, Tabs, Pagination } from "@mantine/core"
import { orderBy, uniqBy, map } from "lodash"
import { NoData } from "@/shared-components"
import { StyledSelect } from "@/design-components"
import { StyledTabs, StyledTab, OrderWrapper, StyledGrid } from "./kds.style"
import Order from "../kds/components/order-item"
import { MerchantLegend } from "./components/Legend"
import Pusher from "pusher-js"
import API from "@/services/api"

const STATUS_ORDER = Object.keys(ORDER_STATUS) as Array<OrderStatusType>

const KDS = () => {
	const [activeTab, setActiveTab] = useState(ORDER_STATUS.PENDING.value)
	const [pagesPerTab, setPagesPerTab] = useState(
		STATUS_ORDER.reduce((acc, status) => {
			acc[ORDER_STATUS[status].value] = 1
			return acc
		}, {} as Record<string, number>)
	)
	const [ordersPerTab, setOrdersPerTab] = useState(
		STATUS_ORDER.reduce((acc, status) => {
			acc[ORDER_STATUS[status].value] = { data: [], page: 1, total: 0 }
			return acc
		}, {} as Record<string, { data: any[]; page: number; total: number }>)
	)
	const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date())
	const [isLoading, setIsLoading] = useState(false)

	const [hotelIdFilter, setHotelIdFilter] = useState<null | string>(null)
	const [merchantIdFilter, setMerchantIdFilter] = useState<null | string>(null)

	const updateQueryString = useQueryString()

	const refetchOrders = useCallback(
		async (status: string, page: number, callback?: () => void) => {
			setIsLoading(true)
			try {
				const data = await API.getKdsOrders({
					page,
					status,
					hotelId: hotelIdFilter,
					merchantId: merchantIdFilter
				})

				setOrdersPerTab(prev => ({
					...prev,
					[status]: {
						data: data.data,
						page: data.page,
						total: data.total
					}
				}))
				setLastUpdatedTime(new Date())

				if (callback) {
					callback()
				}
			} catch (error) {
				console.error("Failed to fetch orders:", error)
			} finally {
				setIsLoading(false)
			}
		},
		[hotelIdFilter, merchantIdFilter]
	)

	useEffect(() => {
		STATUS_ORDER.forEach(status => {
			refetchOrders(ORDER_STATUS[status].value, 1)
		})
	}, [refetchOrders])

	useEffect(() => {
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(ORDER_CHANNEL)
		const events = [ORDER_STATUS_UPDATED_EVENT, ORDER_CREATED_EVENT]

		events.forEach(eventName => {
			channel.bind(eventName, () => {
				STATUS_ORDER.forEach(status => {
					refetchOrders(
						ORDER_STATUS[status].value,
						pagesPerTab[ORDER_STATUS[status].value]
					)
				})
			})
		})

		return () => {
			pusher.unsubscribe(ORDER_CHANNEL)
			pusher.disconnect()
		}
	}, [pagesPerTab, refetchOrders])

	const handleTabChange = (value: string) => {
		const newTab = value || ORDER_STATUS.PENDING.value
		setActiveTab(newTab)

		setPagesPerTab(prev => ({
			...prev,
			[activeTab]: 1
		}))

		refetchOrders(newTab, 1, () => {
			setPagesPerTab(prev => ({
				...prev,
				[newTab]: 1
			}))
		})
	}

	const handlePageChange = (page: number) => {
		setPagesPerTab(prev => ({
			...prev,
			[activeTab]: page
		}))
		refetchOrders(activeTab, page)
	}

	const allOrders = useMemo(() => {
		return Object.values(ordersPerTab).flatMap(statusData => statusData.data)
	}, [ordersPerTab])

	const hotelOptions = useMemo(() => {
		return orderBy(
			uniqBy(
				map(allOrders, order => ({
					value: order.hotelId || "",
					label: order.hotelName || "Unknown Hotel"
				})).filter(option => option.value && option.label),
				"value"
			),
			"label"
		)
	}, [allOrders])

	const merchantOptions = useMemo(() => {
		return orderBy(
			uniqBy(
				map(allOrders, order => ({
					value: order.merchantId || "",
					label: order.merchantName || "Unknown Merchant"
				})).filter(option => option.value && option.label),
				"value"
			),
			"label"
		)
	}, [allOrders])

	const { merchantColors } = useMemo(() => {
		const merchants = uniqBy(
			allOrders.map(order => ({
				id: order.merchantId,
				name: order.merchantName,
				color: order.merchantColor
			})),
			"id"
		)

		const merchantColors = merchants.reduce((acc, merchant) => {
			acc[merchant.id] = merchant.color
			return acc
		}, {} as Record<string, string>)

		return { merchantColors }
	}, [allOrders])

	const sortedOrders = useMemo(() => {
		const orders = Object.values(ordersPerTab[activeTab].data)
		if (activeTab === ORDER_STATUS.SCHEDULED.value) {
			return orderBy(orders, ["scheduledDate"], ["asc"])
		}
		return orderBy(orders, ["orderDate"], ["desc"])
	}, [activeTab, ordersPerTab])

	return (
		<PageStructure
			title='KDS - Kitchen Display System'
			headerContent={
				<LastUpdatedAgo
					refetchOnClick={() => {
						STATUS_ORDER.forEach(status =>
							refetchOrders(
								ORDER_STATUS[status].value,
								pagesPerTab[ORDER_STATUS[status].value]
							)
						)
					}}
					lastUpdatedTime={lastUpdatedTime}
				/>
			}
			subHeaderContent={
				<Flex gap={12} style={{ width: "100%" }} align={"center"}>
					<div>
						<StyledSelect
							placeholder='Hotel'
							searchable
							clearable={true}
							value={hotelIdFilter}
							data={hotelOptions}
							onChange={(value: string) => {
								setHotelIdFilter(value)
								updateQueryString([{ fieldName: "hotel", value }])
							}}
						/>
					</div>
					<div>
						<StyledSelect
							placeholder='Merchant'
							searchable
							clearable={true}
							value={merchantIdFilter}
							data={merchantOptions}
							onChange={(value: string) => {
								setMerchantIdFilter(value)
								updateQueryString([{ fieldName: "merchant", value }])
							}}
						/>
					</div>
					<MerchantLegend hotelId={hotelIdFilter} />
				</Flex>
			}
			pageContent={
				<StyledTabs
					defaultValue={ORDER_STATUS.PENDING.value}
					value={activeTab}
					onTabChange={handleTabChange}
				>
					<Tabs.List>
						{STATUS_ORDER.map(statusKey => (
							<StyledTab key={statusKey} value={ORDER_STATUS[statusKey].value}>
								{statusKey === "PREPARATION"
									? "Waiting for Pickup"
									: ORDER_STATUS[statusKey].label}
								{ordersPerTab[ORDER_STATUS[statusKey].value].total > 0 &&
									` (${ordersPerTab[ORDER_STATUS[statusKey].value].total})`}
							</StyledTab>
						))}
					</Tabs.List>

					{isLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{STATUS_ORDER.map(statusKey => (
								<Tabs.Panel
									key={statusKey}
									value={ORDER_STATUS[statusKey].value}
									pt='xs'
								>
									{ordersPerTab[ORDER_STATUS[statusKey].value].data.length ===
									0 ? (
										<NoData message='No orders found' minHeight={600} />
									) : (
										<StyledGrid>
											{sortedOrders.map(order => (
												<Grid.Col key={order.id} span='auto'>
													<OrderWrapper>
														<Order
															orderId={order.id}
															orderNonce={order.nonce}
															orderItems={order.items}
															version={order.version}
															status={order.status}
															comment={order.comment}
															cancelReason={order.cancelReason}
															cancelOption={order.cancelOption}
															orderDate={order.orderDate}
															timezone={order.timezone}
															roomNumber={order.roomNumber}
															scheduledDate={order.scheduledDate}
															numberOfCutleries={order.numberOfCutleries}
															hotelAddressTown={order.hotelAddress}
															hotelAddressZipCode={order.hotelAddressZipCode}
															hasThirdPartyDelivery={
																order.hasThirdPartyDelivery
															}
															merchantColor={merchantColors[order.merchantId]}
															hotelId={order.hotelId}
															hotelName={order.hotelName}
															clientName={order.clientName}
															merchantAddressNumber={
																order.merchantAddressNumber
															}
															merchantAddressStreet={
																order.merchantAddressStreet
															}
															merchantAddressTown={order.merchantAddressTown}
															merchantAddressZipCode={
																order.merchantAddressZipCode
															}
															merchantName={order.merchantName}
														/>
													</OrderWrapper>
												</Grid.Col>
											))}
										</StyledGrid>
									)}
								</Tabs.Panel>
							))}
						</>
					)}

					<Flex justify='center' align='center' mt='md'>
						<Pagination
							total={Math.ceil(ordersPerTab[activeTab]?.total / 20)}
							value={pagesPerTab[activeTab]}
							onChange={handlePageChange}
						/>
					</Flex>
				</StyledTabs>
			}
		/>
	)
}

export default KDS
