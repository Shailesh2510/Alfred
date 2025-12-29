import { useMemo, useState } from "react"
import { PageStructure } from "@/shared-components"
import { FILTER_SIZE, MERCHANT_ORDER_STATUS } from "@/shared-constants"
import { IconCalendar } from "@tabler/icons-react"
import { useQueryString } from "@/shared-hooks"
import { DatesRangeValue } from "@mantine/dates"
import {
	StyledButton,
	StyledDatePickerInput,
	StyledSearch,
	StyledSelect,
	StyledTable
} from "@/design-components"
import { Flex, Grid, Loader, Pagination } from "@mantine/core"
import useOrders from "@/hooks/order/useOrders"
import { map, orderBy, toInteger, toNumber, uniqBy } from "lodash"
import { NoData } from "@/shared-components"
import { useRouter } from "next/router"
import { customNotification, showPrice } from "@/shared-utils"
import { createDateFromString, formatDate } from "@/shared-utils"
import { TotalPrice, StyledTableRow } from "./order-list.style"
import useExportOrdersReport from "@/hooks/order/useExportOrdersReport"

const OrderList = () => {
	const [hotelIdFilter, setHotelIdFilter] = useState<any>(null)
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [statusFilter, setStatusFilter] = useState<any>(null)
	const [orderRoomFilter, setOrderRoomFilter] = useState<any>(null)
	const [dateRangeFilter, setDateRangeFilter] = useState<
		DatesRangeValue | undefined
	>(undefined)
	const [orderReportDownloading, setOrderReportDownloading] =
		useState<Boolean>(false)

	const router = useRouter()
	const updateQueryString = useQueryString()

	const { data: orders, isLoading: ordersLoading } = useOrders(
		{
			page: currentPage,
			hotelId: hotelIdFilter,
			status: statusFilter,
			roomNumber: orderRoomFilter,
			fromDate: dateRangeFilter?.[0]
				? formatDate(dateRangeFilter?.[0], "yyyy-MM-dd")
				: null,
			toDate: dateRangeFilter?.[1]
				? formatDate(dateRangeFilter?.[1], "yyyy-MM-dd")
				: null
		},
		{
			enabled:
				!!(dateRangeFilter?.[0] && dateRangeFilter?.[1]) ||
				(!dateRangeFilter?.[0] && !dateRangeFilter?.[1])
		}
	)

	const { mutate: exportOrdersReport } = useExportOrdersReport({
		onSuccess: (data: any) => {
			const url = window.URL.createObjectURL(new Blob([data]))
			const link = document.createElement("a")

			link.href = url
			link.setAttribute("download", "report.xlsx")
			document.body.appendChild(link)
			link.click()

			customNotification.success({
				title: "Orders report",
				message: "Orders report generated successfully"
			})
			setOrderReportDownloading(false)
		},
		onError: () => {
			customNotification.error({
				title: "Orders report",
				message: "Orders report generation failed"
			})
			setOrderReportDownloading(false)
		}
	})

	const rows = orders?.data?.map((order: any) => (
		<StyledTableRow
			key={order.id}
			onClick={() => router.push(`/order-list/${order?.id}`)}
		>
			<td>#{order.nonce}</td>
			<td>{formatDate(createDateFromString(order?.orderDate))}</td>
			<td>{MERCHANT_ORDER_STATUS[order?.status]?.label}</td>
			<td>{order.mealPeriodName}</td>
			<td>
				{order?.cancelReason
					? `Cancel reason: ${order?.cancelReason}`
					: MERCHANT_ORDER_STATUS?.[order?.status]?.label}
			</td>
			<td>{order?.numberOfCutleries || "-"}</td>
			<td>{order?.items?.length === 0 ? "-" : order?.items?.length}</td>
			<td>
				<TotalPrice>{showPrice(order.grandTotal)}</TotalPrice>
			</td>
		</StyledTableRow>
	))

	const totalNumberOfPages = useMemo(() => {
		if (orders?.total && orders?.limit) {
			return toInteger(toNumber(orders?.total) / toNumber(orders?.limit) + 1)
		}
		return 0
	}, [orders])

	const statusOptions = orderBy(Object.values(MERCHANT_ORDER_STATUS), "label")

	const hotelOptions = orderBy(
		uniqBy(
			map(orders?.data, order => ({
				value: order.hotelId,
				label: order.hotelName
			})),
			"value"
		),
		"label"
	)

	return (
		<PageStructure
			title='Order list'
			headerContent={
				<Grid gutter={16}>
					<Grid.Col span='auto'>
						<StyledDatePickerInput
							w={280}
							type='range'
							size={FILTER_SIZE}
							placeholder='Pick date range'
							value={dateRangeFilter}
							clearable={true}
							icon={<IconCalendar size='1rem' />}
							inputFormat='YYYY-MM-DD'
							onChange={(value: any) => {
								setDateRangeFilter(value)
								updateQueryString([
									{
										fieldName: "date",
										value: [
											value?.[0] ? formatDate(value[0]) : null,
											value?.[1] ? formatDate(value[1]) : null
										]
									}
								])
							}}
						/>
					</Grid.Col>
					<Grid.Col span='auto'>
						<StyledSelect
							size={FILTER_SIZE}
							placeholder='Status'
							searchable
							clearable={true}
							value={statusFilter}
							data={statusOptions}
							onChange={(value: string) => {
								setStatusFilter(value)
								updateQueryString([{ fieldName: "status", value }])
							}}
						/>
					</Grid.Col>
					<Grid.Col span='auto'>
						<StyledSelect
							size={FILTER_SIZE}
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
					</Grid.Col>
					<Grid.Col span='auto'>
						<StyledSearch
							value={orderRoomFilter}
							onChange={(e: any) => {
								const searchValue = e.target.value
								setOrderRoomFilter(searchValue)
								updateQueryString([{ fieldName: "roomNumber", searchValue }])
							}}
							placeholder='Search for rooms'
						/>
					</Grid.Col>
					<Grid.Col span={1} mx={20}>
						<Flex align='center'>
							<StyledButton
								size='md'
								color='green'
								disabled={orderReportDownloading}
								onClick={() => {
									setOrderReportDownloading(true)
									customNotification.info({
										title: "Exporting orders report",
										message: "The report is being generated, please wait.",
										autoClose: 2000
									})
									exportOrdersReport({
										page: 1,
										fromDate: dateRangeFilter?.[0]
											? formatDate(dateRangeFilter?.[0], "yyyy-MM-dd")
											: null,
										toDate: dateRangeFilter?.[1]
											? formatDate(dateRangeFilter?.[1], "yyyy-MM-dd")
											: null,
										status: statusFilter ? statusFilter : null,
										hotelId: hotelIdFilter ? hotelIdFilter : null
									})
								}}
							>
								Export
							</StyledButton>
						</Flex>
					</Grid.Col>
				</Grid>
			}
			pageContent={
				<>
					{ordersLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{orders?.data?.length === 0 ? (
								<NoData message='No orders found' minHeight={600} />
							) : (
								<>
									<StyledTable w='100%' mb={48}>
										<thead>
											<tr>
												<th>Active Orders</th>
												<th>Canceled Orders</th>
												<th>Delivered Orders</th>
												<th>Delivered total Net</th>
												<th>Delivered total Gross</th>
												<th>Refund Amount</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>{orders?.statistics?.activeOrders || 0}</td>
												<td>{orders?.statistics?.canceledOrders || 0}</td>
												<td>{orders?.statistics?.deliveredOrders || 0}</td>
												<td>
													{showPrice(orders?.statistics?.totalNetOrders || 0)}
												</td>
												<td>
													{showPrice(orders?.statistics?.grandTotalOrders || 0)}
												</td>
												<td>
													{showPrice(
														orders?.statistics?.refundAmountOrders || 0
													)}
												</td>
											</tr>
										</tbody>
									</StyledTable>
									<StyledTable highlightOnHover>
										<thead>
											<tr>
												<th>Order ID</th>
												<th>Order date</th>
												<th>Status</th>
												<th>Meal period</th>
												<th>Last status</th>
												<th>Cutleries & Napkins</th>
												<th>No. items</th>
												<th>Total amount</th>
											</tr>
										</thead>
										<tbody>{rows}</tbody>
									</StyledTable>
								</>
							)}
						</>
					)}
				</>
			}
			footerContent={
				<Flex justify='center' my={40} align='center'>
					{orders?.data?.length > 0 ? (
						<Pagination
							withEdges
							value={currentPage}
							total={totalNumberOfPages}
							onChange={value => setCurrentPage(value)}
						/>
					) : null}
				</Flex>
			}
		/>
	)
}

export default OrderList
