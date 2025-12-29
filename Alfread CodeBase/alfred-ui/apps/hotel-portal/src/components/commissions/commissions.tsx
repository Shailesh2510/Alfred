import { useMemo, useState } from "react"
import { LastUpdatedAgo, PageStructure } from "@/shared-components"
import { FILTER_SIZE } from "@/shared-constants"
import { IconCalendar } from "@tabler/icons-react"
import { useQueryString } from "@/shared-hooks"
import { DatesRangeValue } from "@mantine/dates"
import {
	StyledDatePickerInput,
	StyledSearch,
	StyledTable
} from "@/design-components"
import { Flex, Grid, Loader, Pagination } from "@mantine/core"
import useOrders from "@/hooks/order/useOrders"
import { toInteger, toNumber } from "lodash"
import { NoData } from "@/shared-components"
import { showPrice } from "@/shared-utils"
import { createDateFromString, formatDate } from "@/shared-utils"
import { useInputState } from "@mantine/hooks"
import { StyledTableRow } from "./commissions.style"
import useCommissions from "@/hooks/ambassador/useCommissions"

const Commissions = () => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [orderIdFilter, setOrderIdFilter] = useInputState<string>("")
	const [dateRangeFilter, setDateRangeFilter] = useState<
		DatesRangeValue | undefined
	>(undefined)
	const [referrerFilter, setReferrerFilter] = useInputState<string>("")

	const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date())

	const updateQueryString = useQueryString()

	const {
		data: orders,
		isLoading: ordersLoading,
		refetch: refetchOrders
	} = useOrders(
		{
			page: currentPage,
			nonce: orderIdFilter,
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

	const {
		data: commissions,
		isLoading: commissionsLoading,
		refetch: refetchCommissions
	} = useCommissions(
		{
			page: currentPage,
			nonce: orderIdFilter,
			fromDate: dateRangeFilter?.[0]
				? formatDate(dateRangeFilter?.[0], "yyyy-MM-dd")
				: null,
			toDate: dateRangeFilter?.[1]
				? formatDate(dateRangeFilter?.[1], "yyyy-MM-dd")
				: null,
			ambassador_name: referrerFilter
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

	const rows = commissions?.data?.map((commission: any) => (
		<StyledTableRow key={commission.nonce}>
			<td>{commission?.referrer}</td>
			<td>
				{formatDate(
					createDateFromString(commission?.deliveryDate),
					"MM/dd/yyyy"
				)}
			</td>
			<td>
				{formatDate(
					createDateFromString(commission?.deliveryDate),
					"hh:mm a (zzz)"
				)}
			</td>
			<td>{commission.merchantType}</td>
			<td>{commission.campaignName}</td>
			<td>{showPrice(commission.commissionAmount)}</td>
			<td>{commission.isApproved.toUpperCase()}</td>
			<td>#{commission.nonce}</td>
		</StyledTableRow>
	))

	const totalNumberOfPages = useMemo(() => {
		if (commissions?.count && commissions?.page_size) {
			return toInteger(
				toNumber(commissions?.count) / toNumber(commissions?.page_size) + 1
			)
		}
		return 0
	}, [commissions])

	const handleRefreshClick = () => {
		refetchOrders()
		refetchCommissions()
		setLastUpdatedTime(new Date())
	}

	return (
		<PageStructure
			title='Commission Tracker'
			headerContent={
				<LastUpdatedAgo
					refetchOnClick={handleRefreshClick}
					lastUpdatedTime={lastUpdatedTime}
				/>
			}
			subHeaderContent={
				<Grid gutter={16} mt={16}>
					<Grid.Col xs={12} md={4} xl={4}>
						<StyledSearch
							value={orderIdFilter}
							onChange={setOrderIdFilter}
							placeholder='Search by Order ID'
						/>
					</Grid.Col>
					<Grid.Col xs={12} md={4} xl={4}>
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
					<Grid.Col xs={12} md={4} xl={4}>
						<StyledSearch
							value={referrerFilter}
							onChange={setReferrerFilter}
							placeholder='Search by Referrer'
						/>
					</Grid.Col>
				</Grid>
			}
			pageContent={
				<>
					{ordersLoading && commissionsLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{orders?.data?.length === 0 && commissions?.data?.length === 0 ? (
								<NoData message='No orders found' minHeight={600} />
							) : (
								<>
									<StyledTable highlightOnHover>
										<thead>
											<tr>
												<th>Referer</th>
												<th>Order Completion Date</th>
												<th>Order Completion Time</th>
												<th>Type</th>
												<th>Airport</th>
												<th>Commission</th>
												<th>Payment Status</th>
												<th>Order ID</th>
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

export default Commissions
