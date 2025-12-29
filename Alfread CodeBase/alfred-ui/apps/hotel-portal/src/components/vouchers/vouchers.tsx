import { useMemo, useState } from "react"
import { NoData, PageStructure } from "@/shared-components"
import { IconPlus } from "@tabler/icons-react"
import { Flex, Loader, Pagination } from "@mantine/core"
import {
	StyledSearch,
	StyledButton,
	StyledTable,
	StyledDivider,
	StyledSelect,
	StyledCheckbox
} from "@/design-components"
import useVoucherCodes from "@/hooks/voucher/useVoucherCodes"
import { map, find, toInteger, toNumber, filter } from "lodash"
import { useInputState } from "@mantine/hooks"
import {
	createDateFromString,
	customNotification,
	formatDate,
	showPrice
} from "@/shared-utils"
import AddVoucherCodeModal from "./components/add-voucher-code-modal"
import useExportVouchersReport from "@/hooks/voucher/useExportVouchersReport"
import { useRouter } from "next/router"
import useVoucherPrograms from "@/hooks/voucher/useVoucherPrograms"
import { DISCOUNT_VOUCHER_TYPE, VOUCHER_TYPES } from "@/shared-constants"

const Vouchers = () => {
	const [voucherCodePage, setVoucherCodePage] = useState<number>(1)
	const [voucherCodeFilter, setVoucherCodeFilter] = useInputState<string>("")
	const [voucherProgramFilter, setVoucherProgramFilter] =
		useInputState<string>("")
	const [voucherClaimedFilter, setVoucherClaimedFilter] =
		useInputState<boolean>(false)
	const [addVoucherCodeModalOpen, setAddVoucherCodeModalOpen] =
		useInputState<boolean>(false)
	const [orderReportDownloading, setOrderReportDownloading] =
		useState<Boolean>(false)
	const router = useRouter()

	const {
		data: voucherCodes,
		isLoading: voucherCodesLoading,
		refetch: refetchVoucherCodes
	} = useVoucherCodes({
		page: voucherCodePage,
		voucherCode: voucherCodeFilter,
		voucherClaimed: voucherClaimedFilter,
		voucherProgramId: voucherProgramFilter
	})

	const { data: voucherPrograms } = useVoucherPrograms()

	const { mutate: exportVouchersReport } = useExportVouchersReport({
		onSuccess: (data: any) => {
			const url = window.URL.createObjectURL(new Blob([data]))
			const link = document.createElement("a")

			link.href = url
			link.setAttribute("download", "vouchers.xlsx")
			document.body.appendChild(link)
			link.click()

			customNotification.success({
				title: "Vouchers report",
				message: "Vouchers report generated successfully"
			})
			setOrderReportDownloading(false)
		},
		onError: () => {
			customNotification.error({
				title: "Vouchers report",
				message: "Vouchers report generation failed"
			})
			setOrderReportDownloading(false)
		}
	})

	const tableRows = voucherCodes?.data?.map((voucherCode: any) => {
		const voucherProgram = find(voucherPrograms?.data, {
			id: voucherCode?.voucherProgramId
		})
		return (
			<tr key={voucherCode.id}>
				<td>{voucherCode.code}</td>
				<td>{voucherCode.voucherProgramName}</td>
				<td>{voucherCode.voucherProgramType}</td>
				<td>
					{voucherProgram?.type === VOUCHER_TYPES.DISCOUNT.value &&
					voucherProgram?.amountType === DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value
						? `${parseFloat(voucherCode.totalAmount)?.toFixed(2)}%`
						: showPrice(voucherCode.totalAmount)}
				</td>
				<td>{showPrice(voucherCode.amountUsed)}</td>
				<td>
					{voucherProgram?.type !== VOUCHER_TYPES.DISCOUNT.value
						? showPrice(
								voucherCode.amountUsed
									? parseFloat(voucherCode.totalAmount) -
											parseFloat(voucherCode.amountUsed)
									: parseFloat(voucherCode.totalAmount)
						  )
						: "-"}
				</td>
				<td>
					{voucherCode.claimedDate ? (
						<>{formatDate(createDateFromString(voucherCode.claimedDate))}</>
					) : (
						"-"
					)}
				</td>
				<td>
					{voucherCode.orderId ? (
						<StyledButton
							onClick={() => router.push(`/order-list/${voucherCode.orderId}`)}
						>
							Go to order
						</StyledButton>
					) : (
						"-"
					)}
				</td>
			</tr>
		)
	})

	const totalVoucherCodePages = useMemo(() => {
		if (voucherCodes?.total && voucherCodes?.limit) {
			return toInteger(
				toNumber(voucherCodes?.total) / toNumber(voucherCodes?.limit) + 1
			)
		}
		return 0
	}, [voucherCodes])

	const voucherProgramOptions = map(
		filter(voucherPrograms?.data, { isActive: true }),
		voucherProgram => ({
			label: voucherProgram?.name,
			value: voucherProgram?.id
		})
	)

	return (
		<PageStructure
			title='Vouchers'
			headerContent={
				<Flex gap={16} align='center' justify='flex-end'>
					<StyledSearch
						value={voucherCodeFilter}
						onChange={setVoucherCodeFilter}
						placeholder='Search voucher code'
					/>
					<StyledSelect
						clearable
						value={voucherProgramFilter}
						data={voucherProgramOptions}
						onChange={setVoucherProgramFilter}
						placeholder='Voucher program'
					/>
					<StyledCheckbox
						label='Claimed'
						checked={voucherClaimedFilter}
						onChange={setVoucherClaimedFilter}
					/>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						my='auto'
					/>
					<StyledButton
						size='md'
						color='dark'
						variant='outline'
						leftIcon={<IconPlus size={22} color='black' />}
						onClick={() => setAddVoucherCodeModalOpen(true)}
					>
						Generate Codes
					</StyledButton>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						my='auto'
					/>
					<StyledButton
						color='green'
						size='md'
						disabled={orderReportDownloading}
						onClick={() => {
							setOrderReportDownloading(true)
							customNotification.info({
								title: "Exporting vouchers report",
								message: "The report is being generated, please wait.",
								autoClose: 2000
							})
							exportVouchersReport({
								page: voucherCodePage,
								code: voucherCodeFilter,
								claimed: voucherClaimedFilter,
								voucherProgramId: voucherProgramFilter
							})
						}}
					>
						Export
					</StyledButton>
				</Flex>
			}
			pageContent={
				<>
					{voucherCodesLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{voucherCodes?.data?.length === 0 ? (
								<NoData message='No voucher codes found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>
												<b>Code</b>
											</th>
											<th>Voucher program</th>
											<th>Voucher program type</th>
											<th>Total amount</th>
											<th>Amount used</th>
											<th>Amount remaining</th>
											<th>Claimed on</th>
											<th>Order</th>
										</tr>
									</thead>
									<tbody>{tableRows}</tbody>
								</StyledTable>
							)}
						</>
					)}
					<AddVoucherCodeModal
						refetchVoucherCodes={refetchVoucherCodes}
						addVoucherCodeModalOpen={addVoucherCodeModalOpen}
						setAddVoucherCodeModalOpen={setAddVoucherCodeModalOpen}
					/>
				</>
			}
			footerContent={
				<Flex justify='center' my={40} align='center'>
					{voucherCodes?.data?.length !== 0 && (
						<Pagination
							withEdges
							value={voucherCodePage}
							total={totalVoucherCodePages}
							onChange={value => setVoucherCodePage(value)}
						/>
					)}
				</Flex>
			}
		/>
	)
}

export default Vouchers
