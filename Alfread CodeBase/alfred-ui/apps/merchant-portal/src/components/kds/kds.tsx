import { LastUpdatedAgo, PageStructure } from "@/shared-components"
import { Flex, Loader, Tabs } from "@mantine/core"
import {
	StyledTabs,
	StyledTab,
	LastUpdatedContainer,
	StyledFlex
} from "./kds.style"
import OrderItem from "./components/order-item"
import useCurrentOrders from "@/hooks/order/useCurrentOrders"
import { useMemo, useState } from "react"
import { NoData } from "@/shared-components"
import { ORDER_STATUS } from "@/shared-constants"
import { getDateRangeFrom3AM } from "@/shared-utils"

const renderOrder = ({ order }: any) => {
	return (
		<OrderItem
			key={order?.id}
			orderId={order?.id}
			orderNonce={order?.nonce}
			status={order?.status}
			orderItems={order?.items}
			comment={order?.comment}
			version={order?.version}
			timezone={order?.timezone}
			orderDate={order?.orderDate}
			cancelOption={order?.cancelOption}
			cancelReason={order?.cancelReason}
			roomNumber={order?.roomNumber}
			scheduledDate={order?.scheduledDate}
			numberOfCutleries={order?.numberOfCutleries}
			clientName={order?.clientName}
			hotelAddressNumber={order?.hotelAddressNumber}
			hotelAddressStreet={order?.hotelAddressStreet}
			hotelAddressTown={order?.hotelAddressTown}
			hotelAddressZipCode={order?.hotelAddressZipCode}
			hasThirdPartyDelivery={
				order?.hotelHasThirdPartyDelivery &&
				order?.merchantHasThirdPartyDelivery
			}
		/>
	)
}

const KDS = () => {
	const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date())

	const {
		data: orders,
		isLoading: ordersLoading,
		refetch: refetchOrders
	} = useCurrentOrders()

	const ordersData = orders?.data

	const sortedOrders = useMemo(() => {
		const { startOfRange, endOfRange } = getDateRangeFrom3AM()
		return {
			pending: ordersData?.filter(
				(order: any) => order.status === ORDER_STATUS.PENDING.value
			),
			confirmed: ordersData?.filter(
				(order: any) => order.status === ORDER_STATUS.CONFIRMED.value
			),
			preparation: ordersData?.filter(
				(order: any) => order.status === ORDER_STATUS.PREPARATION.value
			),
			indelivery: ordersData?.filter(
				(order: any) => order.status === ORDER_STATUS.IN_DELIVERY.value
			),
			delivered: ordersData?.filter(
				(order: any) =>
					order.status === ORDER_STATUS.DELIVERED.value &&
					order.updatedAt >= startOfRange &&
					order.updatedAt < endOfRange
			),
			scheduled: ordersData
				?.filter((order: any) => order.status === ORDER_STATUS.SCHEDULED.value)
				.sort(
					(a: any, b: any) =>
						new Date(a.scheduledDate).getTime() -
						new Date(b.scheduledDate).getTime()
				),
			canceled: ordersData?.filter(
				(order: any) =>
					order.status === ORDER_STATUS.CANCELED.value &&
					order.updatedAt >= startOfRange &&
					order.updatedAt < endOfRange
			)
		}
	}, [ordersData])

	const handleRefreshClick = () => {
		refetchOrders()
		setLastUpdatedTime(new Date())
	}

	const OrderPanel = ({
		orders,
		renderOrder,
		handleRefreshClick,
		lastUpdatedTime
	}: any) => {
		return (
			<>
				<LastUpdatedContainer>
					<LastUpdatedAgo
						refetchOnClick={handleRefreshClick}
						lastUpdatedTime={lastUpdatedTime}
					/>
				</LastUpdatedContainer>
				{orders?.length === 0 ? (
					<NoData message='No orders found' minHeight={600} />
				) : (
					<StyledFlex>
						{orders.map((order: any) => renderOrder({ order }))}
					</StyledFlex>
				)}
			</>
		)
	}

	return (
		<PageStructure
			pageContent={
				<StyledTabs defaultValue='scheduled' variant='outline' radius={4}>
					<Tabs.List>
						<StyledTab value='scheduled'>
							Scheduled{" "}
							{sortedOrders?.scheduled?.length
								? `(${parseInt(sortedOrders?.scheduled?.length)})`
								: null}
						</StyledTab>
						<StyledTab value='pending'>
							Pending{" "}
							{sortedOrders?.pending?.length
								? `(${sortedOrders?.pending?.length})`
								: null}
						</StyledTab>
						<StyledTab value='confirmed'>
							Confirmed{" "}
							{sortedOrders?.confirmed?.length
								? `(${sortedOrders?.confirmed?.length})`
								: null}
						</StyledTab>
						<StyledTab value='preparation'>
							In Preparation{" "}
							{sortedOrders?.preparation?.length
								? `(${sortedOrders?.preparation?.length})`
								: null}
						</StyledTab>
						<StyledTab value='indelivery'>
							In Delivery{" "}
							{sortedOrders?.indelivery?.length
								? `(${sortedOrders?.indelivery?.length})`
								: null}
						</StyledTab>
						<StyledTab value='delivered'>
							Delivered{" "}
							{sortedOrders?.delivered?.length
								? `(${sortedOrders?.delivered?.length})`
								: null}
						</StyledTab>
						<StyledTab value='canceled'>
							Canceled{" "}
							{sortedOrders?.canceled?.length
								? `(${sortedOrders?.canceled?.length})`
								: null}
						</StyledTab>
					</Tabs.List>
					{ordersLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							<Tabs.Panel value='scheduled' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.scheduled}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='pending' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.pending}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='confirmed' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.confirmed}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='preparation' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.preparation}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='indelivery' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.indelivery}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='delivered' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.delivered}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='canceled' pt='xs'>
								<OrderPanel
									orders={sortedOrders?.canceled}
									renderOrder={renderOrder}
									handleRefreshClick={handleRefreshClick}
									lastUpdatedTime={lastUpdatedTime}
								/>
							</Tabs.Panel>
						</>
					)}
				</StyledTabs>
			}
		/>
	)
}

export default KDS
