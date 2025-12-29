import { useMemo, useState } from "react"
import { LastUpdatedAgo, PageStructure } from "@/shared-components"
import { FILTER_SIZE, ORDER_STATUS, PAYMENT_METHOD } from "@/shared-constants"
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
import { filter, map, orderBy, toInteger, toNumber, uniqBy } from "lodash"
import { NoData } from "@/shared-components"
import { useRouter } from "next/router"
import { customNotification, showPrice } from "@/shared-utils"
import { createDateFromString, formatDate } from "@/shared-utils"
import { useInputState } from "@mantine/hooks"
import {
	MerchantName,
	TotalPrice,
	StyledTableRow,
	MerchantContainer,
	MerchantId
} from "./order-list.style"
import useExportOrdersReport from "@/hooks/order/useExportOrdersReport"

const OrderList = () => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [statusFilter, setStatusFilter] = useInputState<any>("")
	const [guestNameFilter, setGuestNameFilter] = useInputState<string>("")
	const [guestEmailFilter, setGuestEmailFilter] = useInputState<string>("")
	const [guestPhoneFilter, setGuestPhoneFilter] = useInputState<string>("")
	const [merchantIdFilter, setMerchantIdFilter] = useInputState<string>("")
	const [paymentMethodFilter, setPaymentMethodFilter] =
		useInputState<string>("")
	const [voucherCodeFilter, setVoucherCodeFilter] = useInputState<string>("")
	const [mealPeriodIdFilter, setMealPeriodIdFilter] = useInputState<string>("")
	const [dateRangeFilter, setDateRangeFilter] = useState<
		DatesRangeValue | undefined
	>(undefined)
	const [orderReportDownloading, setOrderReportDownloading] =
		useState<Boolean>(false)
	const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date())

	const router = useRouter()
	const updateQueryString = useQueryString()

	const {
		data: orders,
		isLoading: ordersLoading,
		refetch: refetchOrders
	} = useOrders(
		{
			page: currentPage,
			status: statusFilter,
			clientName: guestNameFilter,
			clientEmail: guestEmailFilter,
			clientNumber: guestPhoneFilter,
			merchantId: merchantIdFilter,
			voucherCode: voucherCodeFilter,
			mealPeriodId: mealPeriodIdFilter,
			orderType: paymentMethodFilter,
			fromDate: dateRangeFilter?.[0]
				? formatDate(dateRangeFilter?.[0], "yyyy-MM-dd")
				: null,
			toDate: dateRangeFilter?.[1]
				? formatDate(dateRangeFilter?.[1], "yyyy-MM-dd")
				: null
		},
		{
			onSuccess: () => {
				setLastUpdatedTime(new Date())
			},
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
			<td>{ORDER_STATUS[order?.status]?.label}</td>
			<td>
				<MerchantContainer>
					<MerchantName>{order.merchantName}</MerchantName>
					<MerchantId>#{order.merchantId}</MerchantId>
				</MerchantContainer>
			</td>
			<td>{order.mealPeriodName}</td>
			<td>{order.clientName}</td>
			<td>{order.clientEmail}</td>
			<td>{order.clientNumber}</td>
			<td>{order.roomNumber}</td>
			<td>{order.items?.length === 0 ? "-" : order.items?.length}</td>
			<td>{order?.numberOfCutleries || "-"}</td>
			<td>{order?.voucherCode ? order?.voucherCode : "-"}</td>
			<td>
				{toInteger(order?.appliedVoucherAmount) === 0
					? "-"
					: showPrice(order?.appliedVoucherAmount)}
			</td>
			<td>
				<TotalPrice>{showPrice(order.totalNet)}</TotalPrice>
			</td>
			<td>
				<TotalPrice>{showPrice(order.taxAmount)}</TotalPrice>
			</td>
			<td>{toInteger(order?.tip) === 0 ? "-" : showPrice(order?.tip)}</td>
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

	const statusOptions = orderBy(Object.values(ORDER_STATUS), "label")
	const paymentMethodOptions = orderBy(Object.values(PAYMENT_METHOD), "label")
	const merchantOptions = orderBy(
		uniqBy(
			map(orders?.data, order => ({
				value: order.merchantId,
				label: order.merchantName
			})),
			"value"
		),
		"label"
	)

	const mealPeriodOptions = orderBy(
		filter(
			uniqBy(
				map(orders?.data, order => ({
					value: order.mealPeriodId,
					label: `${order?.merchantName} - ${order.mealPeriodName}`
				})),
				"value"
			),
			mealPeriod => mealPeriod?.value !== null
		),
		"label"
	)

	const handleRefreshClick = () => {
		refetchOrders()
		setLastUpdatedTime(new Date())
	}

	return (
		<PageStructure
			title='Order list'
			headerContent={
				<LastUpdatedAgo
					refetchOnClick={handleRefreshClick}
					lastUpdatedTime={lastUpdatedTime}
				/>
			}
			subHeaderContent={
				<Grid gutter={16} mt={16}>
					<Grid.Col xs={12} md={4} xl={3}>
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
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSelect
							size={FILTER_SIZE}
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
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSelect
							size={FILTER_SIZE}
							placeholder='Payment method'
							searchable
							clearable={true}
							value={paymentMethodFilter}
							data={paymentMethodOptions}
							onChange={(value: string) => {
								setPaymentMethodFilter(value)
								updateQueryString([{ fieldName: "payment", value }])
							}}
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSelect
							size={FILTER_SIZE}
							placeholder='Meal period'
							searchable
							clearable={true}
							value={mealPeriodIdFilter}
							data={mealPeriodOptions}
							onChange={(value: string) => {
								setMealPeriodIdFilter(value)
								updateQueryString([{ fieldName: "meal", value }])
							}}
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSearch
							value={guestNameFilter}
							onChange={setGuestNameFilter}
							placeholder='Search by guest name'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSearch
							value={guestEmailFilter}
							onChange={setGuestEmailFilter}
							placeholder='Search by guest email'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSearch
							value={guestPhoneFilter}
							onChange={setGuestPhoneFilter}
							placeholder='Search by guest phone'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledSearch
							value={voucherCodeFilter}
							onChange={setVoucherCodeFilter}
							placeholder='Search by voucher code'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={3}>
						<StyledDatePickerInput
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
										merchantId: merchantIdFilter ? merchantIdFilter : null,
										orderType: paymentMethodFilter ? paymentMethodFilter : null,
										mealPeriodId: mealPeriodIdFilter
											? mealPeriodIdFilter
											: null,
										clientName: guestNameFilter ? guestNameFilter : null,
										clientNumber: guestPhoneFilter ? guestPhoneFilter : null,
										clientEmail: guestEmailFilter ? guestEmailFilter : null,
										voucherCode: voucherCodeFilter ? voucherCodeFilter : null
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
												<th>Merchant</th>
												<th>Meal period</th>
												<th>Guest name</th>
												<th>Guest email</th>
												<th>Guest phone</th>
												<th>Room number</th>
												<th>No. items</th>
												<th>Cutleries & Napkins</th>
												<th>Voucher</th>
												<th>Discount amount</th>
												<th>Total amount net</th>
												<th>Tax</th>
												<th>Tip</th>
												<th>Grand total</th>
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
