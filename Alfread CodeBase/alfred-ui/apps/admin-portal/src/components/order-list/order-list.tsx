import { useMemo, useState } from "react"
import {
	ConfirmDeleteModal,
	LastUpdatedAgo,
	PageStructure
} from "@/shared-components"
import {
	FILTER_SIZE,
	ICON_SIZE,
	ORDER_STATUS,
	PAYMENT_METHOD
} from "@/shared-constants"
import { IconCalendar } from "@tabler/icons-react"
import { useQueryString } from "@/shared-hooks"
import { DatesRangeValue } from "@mantine/dates"
import { IconTrash, IconDotsVertical } from "@tabler/icons-react"
import {
	StyledButton,
	StyledDatePickerInput,
	StyledSearch,
	StyledSelect,
	StyledTable
} from "@/design-components"
import { ActionIcon, Flex, Grid, Loader, Menu, Pagination } from "@mantine/core"
import { filter, map, orderBy, toInteger, toNumber, uniqBy } from "lodash"
import { NoData } from "@/shared-components"
import { useRouter } from "next/router"
import { customNotification, showPrice } from "@/shared-utils"
import { createDateFromString, formatDate } from "@/shared-utils"
import { StyledTableRow } from "./order-list.style"
import useExportOrdersReport from "@/hooks/order/useExportOrdersReport"
import { useInputState } from "@mantine/hooks"
import useDeleteOrder from "@/hooks/order/useDeleteOrder"
import useOrderList from "@/hooks/order/useOrderList"

const OrderList = () => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [orderIdFilter, setOrderIdFilter] = useInputState<null | string>(null)
	const [statusFilter, setStatusFilter] = useState<null | string>(null)
	const [guestNameFilter, setGuestNameFilter] = useInputState<string>("")
	const [guestEmailFilter, setGuestEmailFilter] = useInputState<string>("")
	const [guestPhoneFilter, setGuestPhoneFilter] = useInputState<string>("")
	const [hotelIdFilter, setHotelIdFilter] = useState<null | string>(null)
	const [merchantIdFilter, setMerchantIdFilter] = useState<null | string>(null)
	const [voucherCodeFilter, setVoucherCodeFilter] = useInputState<string>("")
	const [mealPeriodIdFilter, setMealPeriodIdFilter] = useInputState<string>("")
	const [paymentMethodFilter, setPaymentMethodFilter] =
		useInputState<string>("")
	const [orderRoomFilter, setOrderRoomFilter] = useInputState<string>("")
	const [dateRangeFilter, setDateRangeFilter] = useState<
		DatesRangeValue | undefined
	>(undefined)
	const [deleteModalOpen, setDeleteModalOpen] = useState<any>(false)
	const [orderToDelete, setOrderToDelete] = useState<any>(null)
	const [orderReportDownloading, setOrderReportDownloading] =
		useState<Boolean>(false)
	const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date())

	const router = useRouter()
	const updateQueryString = useQueryString()
	const {
		data: orders,
		isLoading: ordersLoading,
		refetch: refetchOrder
	} = useOrderList(
		{
			page: currentPage,
			status: statusFilter,
			nonce: orderIdFilter,
			hotelId: hotelIdFilter,
			merchantId: merchantIdFilter,
			clientName: guestNameFilter,
			clientEmail: guestEmailFilter,
			clientNumber: guestPhoneFilter,
			roomNumber: orderRoomFilter,
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
			}
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

	const { mutate: deleteOrder } = useDeleteOrder({
		onSuccess: () => {
			customNotification.success({
				title: "Delete order",
				message: "Order deleted successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Delete order",
				message: "Order deletion failed"
			})
		},
		onSettled: () => {
			refetchOrder()
			setOrderToDelete(null)
		}
	})

	const rows = orders?.data?.map((order: any) => (
		<StyledTableRow
			key={order.id}
			onClick={() => router.push(`/order-list/${order?.id}`)}
		>
			<td>#{order.nonce}</td>
			<td>{formatDate(createDateFromString(order?.orderDate))}</td>
			<td>{ORDER_STATUS[order.status]?.label}</td>
			<td>{order.hotelName}</td>
			<td>{order.merchantName}</td>
			<td>{order.roomNumber || "-"}</td>
			<td>{order?.numberOfCutleries || "-"}</td>
			<td>{showPrice(order.taxAmount)}</td>
			<td>{showPrice(order.grandTotal)}</td>
			<td onClick={event => event.stopPropagation()}>
				<Menu width={200} shadow='xl' withArrow trigger='hover'>
					<Menu.Target>
						<ActionIcon>
							<IconDotsVertical size={22} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Flex
							direction='column'
							align='center'
							justify='center'
							gap={16}
							p={16}
						>
							{/* <StyledButton
                fullWidth
                color="dark"
                variant="outline"
                leftIcon={<IconEdit size={ICON_SIZE} color="black" />}
                onClick={() => router.push(`/tenant/${merchantId}/meal-periods/edit/${mealPeriod?.id}`)}
              >
                Edit
              </StyledButton> */}
							<StyledButton
								fullWidth
								color='dark'
								variant='outline'
								leftIcon={<IconTrash size={ICON_SIZE} color='black' />}
								onClick={() => {
									setDeleteModalOpen(true)
									setOrderToDelete(order)
								}}
							>
								Delete
							</StyledButton>
						</Flex>
					</Menu.Dropdown>
				</Menu>
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
	const mealPeriodOptions = orderBy(
		filter(
			uniqBy(
				map(orders?.data, order => ({
					value: order.mealPeriodId,
					label: `${order?.merchantName} - ${order.mealPeriodName}`
				})),
				"value"
			),
			(mealPeriod: any) => mealPeriod?.value !== null
		),
		"label"
	)

	const paymentMethodOptions = orderBy(Object.values(PAYMENT_METHOD), "label")
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

	const handleRefreshClick = () => {
		setCurrentPage(1)
		refetchOrder()
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
						<StyledSearch
							placeholder='Order ID'
							value={orderIdFilter}
							onChange={setOrderIdFilter}
						/>
					</Grid.Col>
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
						<StyledDatePickerInput
							type='range'
							size={FILTER_SIZE}
							placeholder='Pick date range'
							value={dateRangeFilter}
							clearable={true}
							icon={<IconCalendar size={ICON_SIZE} />}
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
					<Grid.Col xs={12} md={4} xl={2.5}>
						<StyledSearch
							value={voucherCodeFilter}
							onChange={setVoucherCodeFilter}
							placeholder='Search by voucher code'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={2.5}>
						<StyledSearch
							value={orderRoomFilter}
							onChange={setOrderRoomFilter}
							placeholder='Search for rooms'
						/>
					</Grid.Col>
					<Grid.Col span={1}>
						<Flex align='center' justify={"center"}>
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
										hotelId: hotelIdFilter ? hotelIdFilter : null,
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
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>Order ID</th>
											<th>Order date</th>
											<th>Status</th>
											<th>Hotel name</th>
											<th>Merchant name</th>
											<th>Room Number</th>
											<th>Cutleries & Napkins</th>
											<th>Tax</th>
											<th>Total price</th>
											<th></th>
										</tr>
									</thead>
									<tbody>{rows}</tbody>
								</StyledTable>
							)}
							<ConfirmDeleteModal
								title='Delete order'
								message={
									<>
										Are you sure you want to delete the order `
										<b>{orderToDelete?.nonce}</b>`?
									</>
								}
								modalOpen={deleteModalOpen}
								setModalOpen={setDeleteModalOpen}
								onClose={() => setOrderToDelete(null)}
								onDelete={() => {
									if (orderToDelete?.id) {
										deleteOrder({ orderId: orderToDelete?.id })
									}
								}}
							/>
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
